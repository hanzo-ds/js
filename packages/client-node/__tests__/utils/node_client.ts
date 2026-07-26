import { createTestClient } from "@test/utils";
import type Stream from "stream";
import type {
  DatastoreClient,
  DatastoreClientConfigOptions,
} from "@hanzo-ds/client";

export function createNodeTestClient(
  config: DatastoreClientConfigOptions = {},
): DatastoreClient {
  return createTestClient<Stream.Readable>(config) as DatastoreClient;
}
