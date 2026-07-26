<p align="center">
<img src=".static/logo.svg" width="200px" align="center">
<h1 align="center">Datastore JS client</h1>
</p>
<br/>
<p align="center">
<a href="https://www.npmjs.com/package/@hanzo-ds/client">
<img alt="NPM Version" src="https://img.shields.io/npm/v/%40hanzo-ds%2Fclient?color=%233178C6&logo=npm">
</a>

<a href="https://www.npmjs.com/package/@hanzo-ds/client">
<img alt="NPM Downloads" src="https://img.shields.io/npm/dw/%40hanzo-ds%2Fclient?color=%233178C6&logo=npm">
</a>

<a href="https://github.com/hanzo-ds/js/actions/workflows/tests-node.yml">
<img src="https://github.com/hanzo-ds/js/actions/workflows/tests-node.yml/badge.svg?branch=main">
</a>

<a href="https://github.com/hanzo-ds/js/actions/workflows/tests-web.yml">
<img src="https://github.com/hanzo-ds/js/actions/workflows/tests-web.yml/badge.svg?branch=main">
</a>

<a href="https://codecov.io/gh/hanzo-ds/js">
<img src="https://codecov.io/gh/hanzo-ds/js/graph/badge.svg?token=B832WB00WJ">
</a>

<img src="https://api.scorecard.dev/projects/github.com/hanzo-ds/js/badge">
</p>

## About

Official JS client for [Hanzo Datastore](https://hanzo.ai/), written purely in TypeScript, thoroughly tested with actual Datastore versions.

The client has zero external dependencies and is optimized for maximum performance.

The repository consists of four packages:

- `@hanzo-ds/client` - a version of the client designed for Node.js platform only. It is built on top of [HTTP](https://nodejs.org/api/http.html)
  and [Stream](https://nodejs.org/api/stream.html) APIs; supports streaming for both selects and inserts.
- `@hanzo-ds/client-web` - a version of the client built on top of [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
  and [Web Streams](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API) APIs; supports streaming for selects.
  Compatible with Chrome/Firefox browsers and Cloudflare workers.
- `@hanzo-ds/client-common` - shared common types and the base framework for building a custom client implementation.
- `@hanzo-ds/rowbinary` - a library for reading (and soon writing) Datastore RowBinary format.

## Installation

Node.js client:

```sh
npm i @hanzo-ds/client
```

Web client (browsers, Cloudflare workers):

```sh
npm i @hanzo-ds/client-web
```

## Environment requirements

### Node.js

Node.js must be available in the environment to run the Node.js client. The client is compatible with all the [maintained](https://github.com/nodejs/release#readme) Node.js releases.

| Node.js version | Supported? |
| --------------- | ---------- |
| 26.x            | ✔          |
| 24.x            | ✔          |
| 22.x            | ✔          |
| 20.x            | ✔          |

### TypeScript

If using TypeScript, version [4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html) or above is required to enable [inline import and export syntax](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#type-modifiers-on-import-names).

## Compatibility with Datastore

| Client version | Datastore |
| -------------- | --------- |
| 1.12.0+        | 24.8+     |

The client may work with older versions too; however, this is best-effort support and is not guaranteed.

## Quick start

```ts
import { createClient } from "@hanzo-ds/client"; // or '@hanzo-ds/client-web'

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

See more examples in the [examples directory](./examples).

## Documentation

See the [Datastore website](https://docs.hanzo.ai/datastore/integrations/javascript) for the full documentation.

## Changelog

Each package keeps its own changelog:

- `@hanzo-ds/client` — [`packages/client-node/CHANGELOG.md`](./packages/client-node/CHANGELOG.md)
- `@hanzo-ds/client-web` — [`packages/client-web/CHANGELOG.md`](./packages/client-web/CHANGELOG.md)
- `@hanzo-ds/client-common` (deprecated) — [`packages/client-common/CHANGELOG.md`](./packages/client-common/CHANGELOG.md)
- `@hanzo-ds/datatype-parser` — [`packages/datatype-parser/CHANGELOG.md`](./packages/datatype-parser/CHANGELOG.md)
- `@hanzo-ds/rowbinary` — [`skills/datastore-js-node-rowbinary/CHANGELOG.md`](./skills/datastore-js-node-rowbinary/CHANGELOG.md)

History through `@hanzo-ds/client` 1.23.0 lives in the now-frozen repository-wide [`CHANGELOG.md`](./CHANGELOG.md).

## AI Agent Skills

This repository contains agent skills for working with the client:

- `datastore-js-node-troubleshooting` — troubleshooting playbook for the Node.js client.

Install via CLI:

```sh
# per project
npx skills add hanzo-ds/js
# globally
npx skills add hanzo-ds/js -g
```

Or ask your agent to install it for you:

> install agent skills from hanzo-ds/js

## Usage examples

We have a wide range of [examples](./examples), aiming to cover various scenarios of client usage. The overview is available in the [examples README](https://github.com/hanzo-ds/js/blob/main/examples/README.md#overview).

## Contact us

If you have any questions or need help, feel free to reach out to us in the [Community Slack](https://hanzo.ai) (`#datastore-js` channel) or via [GitHub issues](https://github.com/hanzo-ds/js/issues).

## Contributing

Check out our [contributing guide](./CONTRIBUTING.md).

If you'd like to build a client for an alternative runtime (such as Bun or Cloudflare Workers) or an alternative protocol (such as the native Datastore protocol or gRPC over a proxy), see [Building specialized clients for alternative runtimes and protocols](./ALTERNATIVE_CLIENTS.md).
