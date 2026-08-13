import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Http from "node:http";
import { AddressInfo } from "node:net";
import type Stream from "stream";
import type { DatastoreClient } from "@hanzo/datastore-client-common";
import { DatastoreError } from "@hanzo/datastore-client-common";
import { createSimpleNodeTestClient } from "../utils/simple_node_client";

// Datastore can respond with HTTP 200 but still report an exception via the
// `X-Datastore-Exception-Code` header (e.g., when an error occurs while the
// response is being streamed). See https://github.com/hanzoai/datastore/pull/8786
describe("[Node.js] 200 response with X-Datastore-Exception-Code header", () => {
  const errorMessage =
    "Code: 395. DB::Exception: Value passed to 'throwIf' function is non-zero: " +
    "while executing 'FUNCTION throwIf(equals(number, 3) :: 1) -> throwIf(equals(number, 3))'. " +
    "(FUNCTION_THROW_IF_VALUE_IS_NON_ZERO) (version 24.3.1)";

  let server: Http.Server;
  let client: DatastoreClient<Stream.Readable>;

  beforeAll(async () => {
    server = Http.createServer((_req, res) => {
      res.writeHead(200, {
        "Content-Type": "text/plain; charset=UTF-8",
        "X-Datastore-Exception-Code": "395",
      });
      res.end(errorMessage);
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const { port } = server.address() as AddressInfo;
    client = createSimpleNodeTestClient({
      url: `http://127.0.0.1:${port}`,
    }) as unknown as DatastoreClient<Stream.Readable>;
  });

  afterAll(async () => {
    await client.close();
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
  });

  it("should reject a query with a parsed DatastoreError", async () => {
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
  });

  it("should reject with a DatastoreError instance", async () => {
    await expect(client.query({ query: "SELECT 1" })).rejects.toBeInstanceOf(
      DatastoreError,
    );
  });

  it("should reject insert/command/exec as well", async () => {
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
  });
});
