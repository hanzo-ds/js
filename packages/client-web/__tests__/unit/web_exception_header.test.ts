import { describe, it, expect } from "vitest";
import { DatastoreError } from "@hanzo/datastore-client-common";
import { createSimpleWebTestClient } from "../utils/simple_web_client";

// Datastore can respond with HTTP 200 but still report an exception via the
// `X-Datastore-Exception-Code` header (e.g., when an error occurs while the
// response is being streamed). See https://github.com/hanzoai/datastore/pull/8786
describe("[Web] 200 response with X-Datastore-Exception-Code header", () => {
  const errorMessage =
    "Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: " +
    "while executing 'FUNCTION throwIf(equals(number, 3) :: 1) -> throwIf(equals(number, 3))'. " +
    "(FUNCTION_THROW_IF_VALUE_IS_NON_ZERO) (version 24.3.1)";

  function createClientWithMockedFetch() {
    const mockedFetch: typeof fetch = async () =>
      new Response(errorMessage, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=UTF-8",
          "X-Datastore-Exception-Code": "395",
        },
      });
    return createSimpleWebTestClient({
      url: "http://localhost:8123",
      fetch: mockedFetch,
    });
  }

  it("should reject a query with a parsed DatastoreError", async () => {
    const client = createClientWithMockedFetch();
    await expect(
      client.query({ query: "SELECT throwIf(number = 3) FROM numbers(10)" }),
    ).rejects.toEqual(
      expect.objectContaining({
        code: "395",
        type: "FUNCTION_THROW_IF_VALUE_IS_NON_ZERO",
        message: expect.stringContaining(
          "Value passed to 'throwIf' function is non-zero",
        ),
      }),
    );
    await client.close();
  });

  it("should reject with a DatastoreError instance", async () => {
    const client = createClientWithMockedFetch();
    await expect(client.query({ query: "SELECT 1" })).rejects.toBeInstanceOf(
      DatastoreError,
    );
    await client.close();
  });

  it("should reject insert/command/exec as well", async () => {
    const client = createClientWithMockedFetch();
    await expect(
      client.insert({
        table: "test",
        values: [{ x: 1 }],
        format: "JSONEachRow",
      }),
    ).rejects.toBeInstanceOf(DatastoreError);
    await expect(
      client.command({ query: "OPTIMIZE TABLE test" }),
    ).rejects.toBeInstanceOf(DatastoreError);
    await expect(client.exec({ query: "SELECT 1" })).rejects.toBeInstanceOf(
      DatastoreError,
    );
    await client.close();
  });
});
