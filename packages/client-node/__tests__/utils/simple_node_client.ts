// Import directly from the side-effect-free module (not from `@test/utils`)
// so that creating a simple client never registers the shared `beforeAll`
// test-environment initializer and stays runnable without Datastore.
import { createSimpleTestClient } from "@test/utils/simple_client";
import type Stream from "stream";
import type {
  DatastoreClient,
  DatastoreClientConfigOptions,
} from "@hanzo-ds/client";

export function createSimpleNodeTestClient(
  config: DatastoreClientConfigOptions = {},
): DatastoreClient {
  return createSimpleTestClient<Stream.Readable>(config) as DatastoreClient;
}
