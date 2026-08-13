import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { DatastoreClient } from "@hanzo/datastore-client-common";
import { createTestClient } from "../utils";

// Regression test for the X-Datastore-Exception-Code header check.
//
// When `send_progress_in_http_headers` is enabled, Datastore commits to HTTP
// 200 before the query completes. If an exception then occurs (e.g. via
// throwIf in a WHERE clause) the server cannot change the status code; instead
// it signals the failure via the `X-Datastore-Exception-Code` response header.
// The client must detect that header and reject with a DatastoreError even
// though the HTTP status is 200.
//
// Repro (adapted from the original):
//   curl -sS -i 'http://localhost:8123/?send_progress_in_http_headers=1&http_headers_progress_interval_ms=100' \
//     --data-binary "SELECT count() FROM numbers(20) WHERE sleepEachRow(0.2) = 0 AND NOT throwIf(number = 10, 'simulated mid-query failure') SETTINGS max_block_size = 1"
describe("X-Datastore-Exception-Code header (200 with exception)", () => {
  let client: DatastoreClient;
  beforeEach(() => {
    client = createTestClient();
  });
  afterEach(async () => {
    await client.close();
  });

  it("rejects with a DatastoreError when X-Datastore-Exception-Code is set on a 200 response", async () => {
    // sleepEachRow(0.05) ensures enough time passes for Datastore to flush the
    // first progress headers (committing the HTTP 200 status) before throwIf
    // fires at row 10, reproducing the "200 + exception header" scenario.
    await expect(
      client.query({
        query:
          "SELECT count() FROM numbers(20) WHERE sleepEachRow(0.05) = 0 AND NOT throwIf(number = 10, 'simulated mid-query failure') SETTINGS max_block_size = 1",
        datastore_settings: {
          send_progress_in_http_headers: 1,
          http_headers_progress_interval_ms: "100",
        },
      }),
    ).rejects.toMatchObject({
      code: "395",
      message: expect.stringContaining("simulated mid-query failure"),
    });
  });
});
