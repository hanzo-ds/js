import { describe, it, expect, afterEach } from "vitest";
import { type DatastoreClient } from "@hanzo/datastore-client-common";
import { createTestClient } from "../utils";

describe("ping", () => {
  let client: DatastoreClient;
  afterEach(async () => {
    await client.close();
  });

  it("makes a ping request", async () => {
    client = createTestClient();
    const response = await client.ping();
    expect(response.success).toBe(true);
  });
});
