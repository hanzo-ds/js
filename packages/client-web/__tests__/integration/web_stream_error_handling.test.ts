import { describe, it, beforeEach, afterEach } from "vitest";
import {
  assertError,
  streamErrorQueryParams,
} from "@test/fixtures/stream_errors";
import { isDatastoreVersionAtLeast } from "@test/utils/server_version";
import type { DatastoreClient } from "@hanzo-ds/client-web";
import type { DatastoreError } from "@hanzo-ds/client-web";
import { createWebTestClient } from "../utils/web_client";

// See https://github.com/hanzoai/datastore/pull/88818
describe("[Web] Stream error handling", () => {
  let client: DatastoreClient;

  beforeEach(async () => {
    client = createWebTestClient();
  });
  afterEach(async () => {
    await client.close();
  });

  it("with reader", async ({ skip }) => {
    if (!(await isDatastoreVersionAtLeast(client, 25, 11))) {
      skip();
    }

    let caughtError: DatastoreError | null = null;

    try {
      const queryParams = streamErrorQueryParams();
      const rs = await client.query(queryParams);

      const reader = rs.stream<{ n: number }>().getReader();
      while (true) {
        const { done, value: rows } = await reader.read();
        if (done) break;
        for (const row of rows) {
          row.json(); // ignored
        }
      }
    } catch (err) {
      caughtError = err as DatastoreError;
    }

    assertError(caughtError);
  });
});
