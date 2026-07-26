# @hanzo-ds/client

Official Node.js client for [Datastore](https://hanzo.ai/), written
purely in TypeScript and thoroughly tested against actual Datastore versions.

It is built on top of the Node.js [HTTP](https://nodejs.org/api/http.html) and
[Stream](https://nodejs.org/api/stream.html) APIs and supports streaming for
both selects and inserts. The client has zero external dependencies and is
optimized for maximum performance.

> Looking for a browser / edge runtime (Cloudflare Workers, etc.) instead? Use
> [`@hanzo-ds/client-web`](https://www.npmjs.com/package/@hanzo-ds/client-web).

## Installation

```sh
npm i @hanzo-ds/client
```

## Environment requirements

Node.js must be available in the environment to run the client. The client is
compatible with all the [maintained](https://github.com/nodejs/release#readme)
Node.js releases.

| Node.js version | Supported? |
| --------------- | ---------- |
| 26.x            | ✔          |
| 24.x            | ✔          |
| 22.x            | ✔          |
| 20.x            | ✔          |

If using TypeScript, version
[4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html)
or above is required to enable
[inline import and export syntax](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names).

## Compatibility with Datastore

| Client version | Datastore |
| -------------- | --------- |
| 1.12.0+        | 24.8+     |

The client may work with older versions too; however, this is best-effort
support and is not guaranteed.

## Quick start

```ts
import { createClient } from "@hanzo-ds/client";

const client = createClient({
  url: process.env.DATASTORE_URL ?? "http://localhost:8123",
  username: process.env.DATASTORE_USER ?? "default",
  password: process.env.DATASTORE_PASSWORD ?? "",
});

const resultSet = await client.query({
  query: "SELECT * FROM system.tables",
  format: "JSONEachRow",
});

const tables = await resultSet.json();
console.log(tables);

await client.close();
```

See more examples in the
[examples directory](https://github.com/hanzo-ds/js/tree/main/examples).

## Documentation

See the [Datastore website](https://docs.hanzo.ai/datastore/integrations/javascript)
for the full documentation.

## Changelog

See [`CHANGELOG.md`](https://github.com/hanzo-ds/js/blob/main/packages/client-node/CHANGELOG.md).

## Contact us

If you have any questions or need help, feel free to reach out to us in the
[Community Slack](https://hanzo.ai) (`#datastore-js` channel) or
via [GitHub issues](https://github.com/hanzo-ds/js/issues).

## License

[Apache 2.0](https://github.com/hanzo-ds/js/blob/main/LICENSE)
