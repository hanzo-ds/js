// Import directly from the side-effect-free module (not from `@test/utils`)
// so that creating a simple client never registers the shared `beforeAll`
// test-environment initializer and stays runnable without Datastore.
import { createSimpleTestClient } from "@test/utils/simple_client";
import type { DatastoreClientConfigOptions } from "@hanzo/datastore-client-web";
import type { DatastoreClient } from "@hanzo/datastore-client-web";

export function createSimpleWebTestClient(
  config: DatastoreClientConfigOptions = {},
): DatastoreClient {
  return createSimpleTestClient(config) as unknown as DatastoreClient;
}
