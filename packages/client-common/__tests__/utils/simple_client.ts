import {
  DatastoreLogLevel,
  type BaseDatastoreClientConfigOptions,
  type DatastoreClient,
} from "@hanzo-ds/client-common";
import { TestLogger } from "./test_logger";

/**
 * Resolves the test logger configuration based on the provided config and the
 * `LOG_LEVEL` environment variable. Shared between {@link createSimpleTestClient}
 * and the environment-aware `createTestClient`.
 */
export function getTestLogConfig(
  config: BaseDatastoreClientConfigOptions = {},
): BaseDatastoreClientConfigOptions["log"] {
  const level =
    config.log?.level ??
    (!process.env.LOG_LEVEL || process.env.LOG_LEVEL === "undefined"
      ? undefined
      : DatastoreLogLevel[
          process.env.LOG_LEVEL as keyof typeof DatastoreLogLevel
        ]);
  return {
    LoggerClass: TestLogger,
    level,
  };
}

/**
 * Creates a test client that does NOT require a running Datastore instance.
 *
 * Unlike `createTestClient`, this factory lives in its own module that does not
 * register the shared `beforeAll` test-environment initializer and does not read
 * any Datastore connection details from the environment. Importing it therefore
 * never pulls in the shared test-env init, which makes it safe to use from unit
 * tests that must be runnable without a reachable Datastore instance.
 *
 * No network request is performed unless the test explicitly issues one.
 */
export function createSimpleTestClient<Stream = unknown>(
  config: BaseDatastoreClientConfigOptions = {},
): DatastoreClient<Stream> {
  return (globalThis as any).environmentSpecificCreateClient({
    log: getTestLogConfig(config),
    ...config,
  }) as DatastoreClient<Stream>;
}
