import { createTestClient } from "@test/utils";
import type { DatastoreClientConfigOptions } from "@hanzo/datastore-client-web";
import type { DatastoreClient } from "@hanzo/datastore-client-web";

export function createWebTestClient(
  config: DatastoreClientConfigOptions = {},
): DatastoreClient {
  return createTestClient(config) as unknown as DatastoreClient;
}
