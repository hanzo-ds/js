import { createTestClient } from "@test/utils";
import type { DatastoreClientConfigOptions } from "@hanzo-ds/client-web";
import type { DatastoreClient } from "@hanzo-ds/client-web";

export function createWebTestClient(
  config: DatastoreClientConfigOptions = {},
): DatastoreClient {
  return createTestClient(config) as unknown as DatastoreClient;
}
