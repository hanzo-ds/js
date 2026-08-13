import { expect } from "vitest";

import type { QueryParamsWithFormat } from "@hanzo/datastore-client-common";
import { DatastoreError } from "@hanzo/datastore-client-common";

export function streamErrorQueryParams(): QueryParamsWithFormat<"JSONEachRow"> {
  return {
    query: `SELECT toInt32(number) AS n,
                   throwIf(number = 10, 'boom') AS e,
                   sleepEachRow(0.001)
            FROM system.numbers LIMIT 100`,
    format: "JSONEachRow",
    datastore_settings: {
      // enforcing at least a few blocks, so that the response code is 200 OK
      max_block_size: "1",
      // Should be false by default since 25.11; but setting explicitly to make sure
      // the server configuration doesn't interfere with the test.
      http_write_exception_in_output_format: false,
    },
  };
}

export function assertError(err: Error | null) {
  expect(err).toBeInstanceOf(DatastoreError);

  const chErr = err as DatastoreError;
  expect(chErr.message).toContain(`boom: while executing 'FUNCTION throwIf`);
  expect(chErr.code).toBe("395");
}
