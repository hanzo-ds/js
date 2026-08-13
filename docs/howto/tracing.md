# Tracing the Datastore client with the `tracer` API

`@hanzo/datastore-client` (and `@hanzo/datastore-client-web`) ships a small,
**zero-dependency** `tracer` configuration option you can use to plug the
client's per-operation lifecycle into any tracing or metrics backend - most
notably [OpenTelemetry](https://opentelemetry.io/), but also Prometheus
counters, a plain `EventEmitter`, or your own logger.

The tracer surface lives entirely inside the client (no extra packages on
`npm install`, nothing to add to your bundle). It is declared as a
**structural subset of the OpenTelemetry `Tracer`/`Span` APIs**, so a raw
OTEL tracer can be passed to the client **as-is** - no adapter, no casts:

```ts
import { createClient } from "@hanzo/datastore-client";
import { trace } from "@opentelemetry/api";

const client = createClient({
  url: "http://localhost:8123",
  tracer: trace.getTracer("@hanzo/datastore-client"),
});
```

## Why a structural subset instead of a built-in dependency

OpenTelemetry's full Node.js distribution (`@opentelemetry/sdk-node` +
`@opentelemetry/sdk-metrics`) adds several megabytes of dependencies on top of
the ~500&nbsp;KB OpenTelemetry API package (`@opentelemetry/api`) and is
undesirable for many users. The client therefore ships **only the type
shapes**, declared so that OTEL's real `Tracer` and `Span` satisfy them
structurally - and users who don't want tracing pay nothing for it, on disk
or at runtime.

## Tracer surface

```ts
import type {
  DatastoreTracer,
  DatastoreSpan,
  DatastoreSpanOptions,
  DatastoreSpanAttributes,
  DatastoreSpanStatus,
} from "@hanzo/datastore-client"; // or '@hanzo/datastore-client-web'

interface DatastoreTracer<TSpan extends DatastoreSpan = DatastoreSpan> {
  startActiveSpan<T>(
    name: string,
    options: DatastoreSpanOptions,
    fn: (span: TSpan) => T,
  ): T;
}

interface DatastoreSpan {
  setAttributes(attributes: DatastoreSpanAttributes): void;
  setStatus(status: DatastoreSpanStatus): void; // { code: number; message?: string }
  recordException(error: Error): void;
  end(): void;
}
```

- `startActiveSpan` has the same shape as OTEL's
  `Tracer.startActiveSpan(name, options, fn)` overload; the options carry
  `kind` (always `DatastoreSpanKind.CLIENT`, value-identical to OTEL's
  `SpanKind.CLIENT`, per the OTEL database semantic conventions) and the
  initial `attributes`. Implementations must invoke `fn` with the new span
  and return `fn`'s result untouched - the client runs the entire operation
  (an `async` function) inside `fn`.
- The span only needs the four methods above; OTEL's `Span` satisfies them
  as-is (its chainable `this`-returning methods are compatible with the
  `void` declarations).
- Status codes are numbers, value-identical to OTEL's `SpanStatusCode`.
  Non-OTEL implementations can match on the exported
  `DatastoreSpanStatusCode` constant (`UNSET: 0`, `OK: 1`, `ERROR: 2`).

### Active-span context propagation

Because the client's operation callback is asynchronous (the span is used
across `await` points inside `fn`), OpenTelemetry needs the
`AsyncLocalStorageContextManager` (from `@opentelemetry/context-async-hooks`)
to keep the Datastore operation span _active_ for the duration of the
request - that is what causes auto-instrumented child spans (e.g. from
`@opentelemetry/instrumentation-http`) to be parented under it.

**This context manager is the default in the OpenTelemetry Node.js SDK**
(`@opentelemetry/sdk-node` / `NodeTracerProvider`), so if you use the
standard SDK setup, no extra work is needed. With a bare
`BasicTracerProvider` (e.g. in tests), register it manually:

```ts
import { context } from "@opentelemetry/api";
import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";

context.setGlobalContextManager(new AsyncLocalStorageContextManager().enable());
```

A complete, runnable version of this setup (wired to an in-memory span
exporter so you can see the emitted spans) lives in
[`examples/node/coding/otel_tracing.ts`](../../examples/node/coding/otel_tracing.ts).

## When the tracer is called

For every call to `query` / `command` / `exec` / `insert` / `ping` (with the
single exception of `insert` with an empty `values` array, which short-circuits
before talking to the server), the client invokes
`startActiveSpan(name, { kind, attributes }, fn)`:

1. The name is one of `datastore.query`, `datastore.command`,
   `datastore.exec`, `datastore.insert`, `datastore.ping` (also exported
   as `DatastoreSpanNames`); `kind` is `DatastoreSpanKind.CLIENT`. The
   initial attribute bag always includes `db.system.name`, `db.namespace`,
   `server.address`, and `server.port`, and - when set -
   `datastore.application`, plus operation-specific entries such as
   `datastore.response.format` (query), `datastore.request.format`,
   `db.operation.name`, `db.collection.name` and `datastore.request.sent_rows`
   (insert; the row count is recorded for array-based inserts only),
   `datastore.request.query_id`, and
   `datastore.request.session_id`.
2. Inside `fn`, the network operation runs with the span as the active span
   (when the context manager supports it; see above).
3. `span.setAttributes({ 'datastore.request.query_id': <server-assigned id> })` -
   so you always have the final `query_id`, even when the caller did not pass
   one and the connection layer generated it. Once the response arrives, the
   span also gets `db.response.status_code` (HTTP status) and, when the
   `X-Datastore-Summary` header is present (e.g. with `wait_end_of_query`),
   `datastore.summary.*` counters (`read_rows`, `written_rows`, …).
4. On success, the span status is left **unset**, per the OTEL span status
   spec for client spans. On failure,
   `span.setAttributes({ 'error.type': <error class name> })` (plus
   `datastore.error.code` with the numeric server error code when the error
   is a server-side `DatastoreError`), then `span.recordException(error)`
   immediately followed by
   `span.setStatus({ code: DatastoreSpanStatusCode.ERROR, message })`.
   Non-`Error` throwables are normalized to `Error` before `recordException`.
5. `span.end()` - exactly once. For `command`/`exec`/`insert`/`ping`, in a
   `finally` block when the method settles; for `query`, see the stream
   lifecycle note below.

Tracer calls are inlined directly on the client's hot path and are **not**
wrapped in defensive try/catch - if your tracer or span throws, the exception
propagates to the caller of `query` / `command` / `exec` / `insert` /
`ping`. Make sure your tracer implementation doesn't throw.

> **Stream lifecycle:** `query()` emits **two spans**.
>
> - `datastore.query` — covers the HTTP request: starts when `query()` is
>   called and ends as soon as the response headers arrive (regardless of how
>   much data is in the body).
> - `datastore.query.stream` — a child span that covers the `ResultSet`
>   lifetime: starts immediately after the response headers are received and
>   ends when the result set is fully consumed (`text()`/`json()` resolve, or
>   the `stream()` is read to completion), closed via `close()`, or fails
>   (the error is recorded on this span). When it ends it carries the final
>   `datastore.response.decoded_bytes` and, for row-streaming consumption,
>   `db.response.returned_rows` metrics.
>
> This split makes it easy to distinguish the original request round-trip from
> a stream that may never end (e.g. tailing a live materialized view). If the
> `ResultSet` is never consumed nor closed, the `datastore.query.stream` span
> is never ended. For `command`/`exec`/`insert`/`ping`, a single span ends
> when the method returns.

## Adapter recipes: `requireParentSpan` and suppressing nested HTTP spans

OpenTelemetry auto-instrumentation packages commonly expose two options that
the client deliberately does **not** implement itself - both belong in a thin
tracer adapter, where they compose with your OTEL setup:

### Only trace when there is an active parent span

Skip Datastore spans when nothing else is being traced (e.g. background
health checks or pings outside any request context). Wrap the tracer and
hand the client a no-op span when there is no active parent:

```ts
import { context, trace } from "@opentelemetry/api";
import {
  createClient,
  type DatastoreSpan,
  type DatastoreTracer,
} from "@hanzo/datastore-client";

const noop = () => undefined;
const noopSpan: DatastoreSpan = {
  setAttributes: noop,
  setStatus: noop,
  recordException: noop,
  end: noop,
};

const otelTracer = trace.getTracer("@hanzo/datastore-client");
const tracer: DatastoreTracer = {
  startActiveSpan: (name, options, fn) =>
    trace.getSpan(context.active()) === undefined
      ? fn(noopSpan) // no active parent span - do not trace this operation
      : otelTracer.startActiveSpan(name, options, fn),
};

const client = createClient({ tracer });
```

### Suppress nested HTTP spans

If `@opentelemetry/instrumentation-http` is registered, every Datastore
operation span gets a duplicate child HTTP span for the underlying request.
To suppress them, run the operation under a suppressed context using
`suppressTracing` from `@opentelemetry/core`:

```ts
import { context, trace } from "@opentelemetry/api";
import { suppressTracing } from "@opentelemetry/core";
import { createClient, type DatastoreTracer } from "@hanzo/datastore-client";

const otelTracer = trace.getTracer("@hanzo/datastore-client");
const tracer: DatastoreTracer = {
  startActiveSpan: (name, options, fn) =>
    otelTracer.startActiveSpan(name, options, (span) =>
      context.with(suppressTracing(context.active()), () => fn(span)),
    ),
};

const client = createClient({ tracer });
```

Alternatively, keep the raw tracer and configure the HTTP instrumentation to
ignore requests to your Datastore endpoint via its
`ignoreOutgoingRequestHook` option.

Both recipes are demonstrated end-to-end in
[`examples/node/coding/otel_tracing.ts`](../../examples/node/coding/otel_tracing.ts).

## Recording-only tracer for tests / debugging

```ts
import {
  DatastoreSpanStatusCode,
  type DatastoreSpan,
  type DatastoreSpanStatus,
  type DatastoreTracer,
} from "@hanzo/datastore-client";

interface RecordedSpan extends DatastoreSpan {
  name: string;
  attributes: Record<string, unknown>;
  status?: DatastoreSpanStatus;
  error?: Error;
}

const recorded: RecordedSpan[] = [];
const tracer: DatastoreTracer<RecordedSpan> = {
  startActiveSpan: (name, options, fn) => {
    const span: RecordedSpan = {
      name,
      attributes: { ...options.attributes },
      setAttributes: (attrs) => Object.assign(span.attributes, attrs),
      setStatus: (status) => {
        span.status =
          status.code === DatastoreSpanStatusCode.UNSET ? undefined : status;
      },
      recordException: (err) => {
        span.error = err;
      },
      end: () => {},
    };
    recorded.push(span);
    return fn(span);
  },
};
```

## Trace context propagation (`traceparent`)

To let the Datastore server link its own spans (recorded in
`system.opentelemetry_span_log`) to your client trace, the outgoing requests
must carry the W3C `traceparent` / `tracestate` headers. With OpenTelemetry,
this happens automatically: Node.js users get header propagation for free
from `@opentelemetry/instrumentation-http` (Web: `instrumentation-fetch`),
since the client uses the platform HTTP stack. With the
`AsyncLocalStorageContextManager` registered (see above), those
auto-instrumented HTTP spans parent under the `datastore.<operation>` span,
so the injected `traceparent` points at the client trace.

To see the server-side spans, the server must have the
`opentelemetry_span_log` table configured (see this repository's
`.docker/datastore/single_node/config.xml` for an example); you can then
correlate by trace id:

```sql
SELECT * FROM system.opentelemetry_span_log
WHERE lower(hex(trace_id)) = '<your 32-char trace id>'
```

## Disabling tracing

Omit the `tracer` option (or set it to `undefined`) and the client will not emit any spans. Internally, it uses a shared no-op tracer/span so the call sites remain monomorphic (branch-free), keeping the overhead minimal (but not strictly zero).
