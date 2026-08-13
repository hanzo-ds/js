import { describe, it, beforeEach, afterEach } from "vitest";
import {
  assertError,
  streamErrorQueryParams,
} from "@test/fixtures/stream_errors";
import { isDatastoreVersionAtLeast } from "@test/utils/server_version";
import type { DatastoreClient } from "@hanzo/datastore-client";
import type { DatastoreError } from "@hanzo/datastore-client";
import { createNodeTestClient } from "../utils/node_client";

// See https://github.com/hanzoai/datastore/pull/88818
describe("[Node.js] Stream error handling", () => {
  let client: DatastoreClient;

  beforeEach(async () => {
    client = createNodeTestClient();
  });
  afterEach(async () => {
    await client.close();
  });

  it("with promise listeners", async ({ skip }) => {
    if (!(await isDatastoreVersionAtLeast(client, 25, 11))) {
      skip();
    }

    let caughtError: DatastoreError | null = null;

    try {
      const queryParams = streamErrorQueryParams();
      const rs = await client.query(queryParams);

      await new Promise<void>((resolve, reject) => {
        const stream = rs.stream<{ n: number }>();
        stream.on("data", (rows) => {
          for (const row of rows) {
            row.json(); // ignored
          }
        });
        stream.on("error", (err) => {
          reject(err);
        });
        stream.on("end", () => {
          resolve();
        });
      });
    } catch (err) {
      caughtError = err as DatastoreError;
    }

    assertError(caughtError);
  });

  it("with async iterators", async ({ skip }) => {
    if (!(await isDatastoreVersionAtLeast(client, 25, 11))) {
      skip();
    }

    let caughtError: DatastoreError | null = null;

    try {
      const queryParams = streamErrorQueryParams();
      const rs = await client.query(queryParams);

      const stream = rs.stream();
      for await (const rows of stream) {
        for (const row of rows) {
          row.json(); // ignored
        }
      }
    } catch (err) {
      caughtError = err as DatastoreError;
    }

    assertError(caughtError);
  });

  it.skip("with .json()", async ({ skip }) => {
    if (!(await isDatastoreVersionAtLeast(client, 25, 11))) {
      skip();
    }

    let caughtError: DatastoreError | null = null;

    try {
      const queryParams = streamErrorQueryParams();
      const rs = await client.query(queryParams);
      await rs.json();
    } catch (err) {
      caughtError = err as DatastoreError;
    }

    assertError(caughtError);
  });

  it.skip("with .text()", async ({ skip }) => {
    if (!(await isDatastoreVersionAtLeast(client, 25, 11))) {
      skip();
    }

    let caughtError: DatastoreError | null = null;

    try {
      const queryParams = streamErrorQueryParams();
      const rs = await client.query(queryParams);
      await rs.text();
    } catch (err) {
      caughtError = err as DatastoreError;
    }

    assertError(caughtError);
  });
});
