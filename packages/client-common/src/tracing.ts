import { DatastoreError } from "./error";

/**
 * A minimal, dependency-free tracer interface that is a structural subset of
 * the {@link https://opentelemetry.io/docs/specs/otel/trace/api/#tracer OpenTelemetry `Tracer` API}.
 *
 * The shapes below are deliberately declared so that a raw OpenTelemetry
 * tracer (the object returned by `trace.getTracer(...)` from
 * `@opentelemetry/api`) is assignable to {@link DatastoreTracer} **as-is**,
 * with no adapter and no casts:
 *
 * ```ts
 * import { trace } from '@opentelemetry/api'
 * const client = createClient({ tracer: trace.getTracer('datastore-js') })
 * ```
 *
 * At the same time, the client itself imports nothing from OpenTelemetry -
 * non-OTEL backends (Prometheus counters, an `EventEmitter`, a plain logger)
 * can implement the same small surface directly.
 *
 * When a {@link DatastoreTracer} is provided via
 * {@link BaseDatastoreClientConfigOptions.tracer}, the client runs each
 * tracked operation (`query`, `command`, `exec`, `insert`, `ping`) inside
 * {@link DatastoreTracer.startActiveSpan}, mutates the provided
 * {@link DatastoreSpan} during the operation
 * ({@link DatastoreSpan.setAttributes}, {@link DatastoreSpan.setStatus},
 * {@link DatastoreSpan.recordException}), and calls
 * {@link DatastoreSpan.end} exactly once. For `command`, `exec`, `insert`,
 * and `ping`, the span ends when the operation settles (regardless of
 * outcome). For `query`, two spans are emitted: the `datastore.query` span
 * ends as soon as the HTTP response headers are received; a child
 * `datastore.query.stream` span is then handed to the `ResultSet`, which
 * tracks the streaming progress and ends it when the response stream is fully
 * consumed, closed, or fails.
 *
 * Calls are inlined directly into the client's hot path - there is no
 * defensive wrapper around them. Any exception thrown by a tracer or span
 * method will propagate up to the caller of the corresponding client method
 * (`query`/`command`/`exec`/`insert`/`ping`). Implementations are therefore
 * expected to be non-throwing; a trivial e2e test against your tracer is
 * usually enough to catch regressions.
 */
export interface DatastoreTracer<TSpan extends DatastoreSpan = DatastoreSpan> {
  /**
   * Called when a tracked operation begins. Same shape as OpenTelemetry's
   * `Tracer.startActiveSpan(name, options, fn)` overload: implementations
   * must invoke `fn` with the new span and return `fn`'s result untouched.
   * The client runs the entire operation (an `async` function) inside `fn`,
   * mutates the span during the operation, and ends it exactly once.
   *
   * @note The callback is asynchronous under the hood: the client keeps using
   * the span across `await` points inside `fn`. For OpenTelemetry, active-span
   * context propagation across those `await`s requires the
   * `AsyncLocalStorageContextManager` (from
   * `@opentelemetry/context-async-hooks`) to be registered - which is the
   * default context manager in the OpenTelemetry Node.js SDK
   * (`@opentelemetry/sdk-node` / `NodeTracerProvider`). With it in place,
   * auto-instrumented child spans (e.g. from
   * `@opentelemetry/instrumentation-http`) are parented under the Datastore
   * operation span.
   */
  startActiveSpan<T>(
    name: string,
    options: DatastoreSpanOptions,
    fn: (span: TSpan) => T,
  ): T;
}

/** Structural subset of the OpenTelemetry `Span` interface - a real OTEL
 *  `Span` is assignable to this type as-is. Methods are declared as
 *  `void`-returning, so OTEL's chainable `this`-returning methods remain
 *  compatible. */
export interface DatastoreSpan {
  /** Attach additional attributes to an in-flight span. Called at least once
   *  for every span - typically right before {@link DatastoreSpan.end} -
   *  with operation-specific attributes such as `datastore.request.query_id`. */
  setAttributes(attributes: DatastoreSpanAttributes): void;
  /** Set the logical status of the span. The codes are value-identical to
   *  OTEL's `SpanStatusCode`; see {@link DatastoreSpanStatusCode}. */
  setStatus(status: DatastoreSpanStatus): void;
  /** Attach an exception that occurred during the span. Called before
   *  {@link DatastoreSpan.setStatus} with the `ERROR` code, before
   *  {@link DatastoreSpan.end}. Non-`Error` throwables are normalized
   *  to `Error` by the client before this call. */
  recordException(error: Error): void;
  /** Called exactly once per span, regardless of success or failure. */
  end(): void;
}

/** Structural subset of OTEL's `SpanOptions`. */
export interface DatastoreSpanOptions {
  /** Value-identical to OTEL's `SpanKind`; see {@link DatastoreSpanKind}.
   *  The client always passes {@link DatastoreSpanKind.CLIENT}, per the
   *  OTEL database semantic conventions. */
  kind?: number;
  /** Initial attributes for the span. */
  attributes?: DatastoreSpanAttributes;
}

/** Span status; `code` values are listed in {@link DatastoreSpanStatusCode}
 *  and are value-identical to OTEL's `SpanStatusCode`. */
export interface DatastoreSpanStatus {
  code: number;
  message?: string;
}

/** Value-identical to OTEL's `SpanStatusCode`, so non-OTEL implementations
 *  do not have to deal with magic numbers. */
export const DatastoreSpanStatusCode = {
  UNSET: 0,
  OK: 1,
  ERROR: 2,
} as const;

/** Value-identical to OTEL's `SpanKind`. The client only ever uses
 *  {@link DatastoreSpanKind.CLIENT}. */
export const DatastoreSpanKind = {
  INTERNAL: 0,
  SERVER: 1,
  CLIENT: 2,
  PRODUCER: 3,
  CONSUMER: 4,
} as const;

/** Free-form attribute bag; a subset of OTEL's `Attributes`. Implementations
 *  should be tolerant of `undefined` values (skip them) and stringify
 *  non-primitive values as needed. */
export type DatastoreSpanAttributes = Record<
  string,
  string | number | boolean | undefined
>;

/** Span name constants used by the client when starting spans.
 *  Exposed so that adapters and tests can match on them. */
export const DatastoreSpanNames = {
  query: "datastore.query",
  /** A child of {@link DatastoreSpanNames.query} that covers the lifetime
   *  of the `ResultSet` stream - from the first byte read to full
   *  consumption, cancellation, or failure.  Ends with
   *  `datastore.response.decoded_bytes` and (for row-streaming paths)
   *  `db.response.returned_rows`. */
  query_stream: "datastore.query.stream",
  command: "datastore.command",
  exec: "datastore.exec",
  insert: "datastore.insert",
  ping: "datastore.ping",
} as const;
export type DatastoreSpanName =
  (typeof DatastoreSpanNames)[keyof typeof DatastoreSpanNames];

const noop = (): void => undefined;
/** Shared no-op span handed out by {@link NoopDatastoreTracer}. @internal */
export const NoopDatastoreSpan: DatastoreSpan = {
  setAttributes: noop,
  setStatus: noop,
  recordException: noop,
  end: noop,
};

/** No-op tracer assigned once at client creation when no tracer is
 *  configured, so the hot path stays branch-free (monomorphic call sites
 *  that the JIT can inline). @internal */
export const NoopDatastoreTracer: DatastoreTracer = {
  startActiveSpan: (_name, _options, fn) => fn(NoopDatastoreSpan),
};

/** Records the exception on the span and marks it with the ERROR status,
 *  normalizing non-`Error` throwables to `Error`.
 *
 *  Sets the {@link https://opentelemetry.io/docs/specs/semconv/registry/attributes/error/#error-type `error.type`}
 *  attribute to the error class name (e.g. `DatastoreError`, `TypeError`),
 *  and, for server-side errors ({@link DatastoreError}), the numeric server
 *  error code as `datastore.error.code`. */
export function recordSpanError(span: DatastoreSpan, err: unknown): void {
  const error = err instanceof Error ? err : new Error(String(err));
  const attributes: DatastoreSpanAttributes = {
    "error.type": error.constructor.name,
  };
  if (error instanceof DatastoreError) {
    const code = Number(error.code);
    attributes["datastore.error.code"] = Number.isNaN(code) ? error.code : code;
  }
  span.setAttributes(attributes);
  span.recordException(error);
  span.setStatus({
    code: DatastoreSpanStatusCode.ERROR,
    message: error.message,
  });
}
