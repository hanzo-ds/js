/* eslint @typescript-eslint/no-var-requires: 0 */
import { beforeAll } from "vitest";
import {
  type BaseDatastoreClientConfigOptions,
  type DatastoreClient,
  type DatastoreSettings,
} from "@hanzo/datastore-client-common";
import { EnvKeys, getFromEnv } from "./env";
import { guid } from "./guid";
import { createSimpleTestClient, getTestLogConfig } from "./simple_client";
import {
  getDatastoreTestEnvironment,
  isCloudTestEnv,
  PRINT_DDL,
  SKIP_INIT,
  TestEnv,
} from "./test_env";

export { createSimpleTestClient };

let databaseName: string;
// Only register the shared test-environment initializer when it is actually
// needed. Skipping the registration entirely (instead of returning early from
// the hook) ensures that importing this module never couples a test suite to a
// reachable Datastore instance when init is skipped.
if (!SKIP_INIT) {
  beforeAll(async () => {
    console.log(
      `\nTest environment: ${getDatastoreTestEnvironment()}, database: ${
        databaseName ?? "default"
      }`,
    );
    const initClient = createTestClient({
      request_timeout: 10_000,
    });
    if (isCloudTestEnv() && databaseName === undefined) {
      await wakeUpPing(initClient);
      databaseName = await createRandomDatabase(initClient);
    }
    await initClient.close();
  });
}

export function createTestClient<Stream = unknown>(
  config: BaseDatastoreClientConfigOptions = {},
): DatastoreClient<Stream> {
  // When the shared test-environment init is skipped, there is no Datastore
  // instance to talk to; fall back to a client that requires no server.
  if (SKIP_INIT) {
    return createSimpleTestClient<Stream>(config);
  }

  const env = getDatastoreTestEnvironment();
  const datastoreSettings: DatastoreSettings = {
    // (U)Int64 are not quoted by default since 25.8
    output_format_json_quote_64bit_integers: 1,
  };
  if (env === TestEnv.LocalCluster) {
    datastoreSettings.insert_quorum = "2";
  } else if (env === TestEnv.Cloud) {
    datastoreSettings.select_sequential_consistency = "1";
  }
  // Allow to override `insert_quorum` if necessary
  Object.assign(datastoreSettings, config?.datastore_settings || {});
  const log = getTestLogConfig(config);

  if (isCloudTestEnv()) {
    return (globalThis as any).environmentSpecificCreateClient({
      url: `https://${getFromEnv(EnvKeys.host)}:8443`,
      password: getFromEnv(EnvKeys.password),
      database: databaseName,
      request_timeout: 60_000,
      log,
      ...config,
      datastore_settings: datastoreSettings,
    }) as DatastoreClient<Stream>;
  } else {
    // The local cluster entrypoint (nginx round-robin LB) is exposed on a different
    // host port than the single-node setup so both can run side by side.
    // See docker-compose.yml for the full port mapping.
    const url =
      env === TestEnv.LocalCluster
        ? "http://127.0.0.1:8127"
        : "http://127.0.0.1:8123";
    return (globalThis as any).environmentSpecificCreateClient({
      url,
      database: databaseName,
      log,
      ...config,
      datastore_settings: datastoreSettings,
    }) as DatastoreClient<Stream>;
  }
}

export async function createRandomDatabase(
  client: DatastoreClient,
): Promise<string> {
  const databaseName = `datastorejs__${guid()}__${+new Date()}`;
  let maybeOnCluster = "";
  if (getDatastoreTestEnvironment() === TestEnv.LocalCluster) {
    maybeOnCluster = ` ON CLUSTER '{cluster}'`;
  }
  const ddl = `CREATE DATABASE IF NOT EXISTS ${databaseName}${maybeOnCluster}`;
  await client.command({
    query: ddl,
    datastore_settings: {
      wait_end_of_query: 1,
    },
  });
  console.log(`\nCreated database ${databaseName}`);
  return databaseName;
}

export async function createTable<Stream = unknown>(
  client: DatastoreClient<Stream>,
  definition: (environment: TestEnv) => string,
  datastore_settings?: DatastoreSettings,
): Promise<void> {
  const env = getDatastoreTestEnvironment();
  const ddl = definition(env);
  await client.command({
    query: ddl,
    datastore_settings: {
      // Force response buffering, so we get the response only when
      // the table is actually created on every node
      // See https://docs.hanzo.ai/datastore/en/interfaces/http/#response-buffering
      wait_end_of_query: 1,
      ...(datastore_settings || {}),
    },
  });

  if (PRINT_DDL) {
    console.info(`\nCreated a table using DDL:\n${ddl}`);
  }
}

export function getTestDatabaseName(): string {
  return databaseName || "default";
}

const MaxPingRetries = 30;
export async function wakeUpPing(client: DatastoreClient): Promise<void> {
  let attempts = 1;
  let lastError: Error | unknown;
  let isAwake = false;
  while (attempts <= MaxPingRetries) {
    const result = await client.ping();
    isAwake = result.success;
    if (result.success) {
      break;
    }
    console.warn(
      `Service is still waking up, ping attempts so far: ${attempts}. Cause:`,
      result.error,
    );
    lastError = result.error;
    attempts++;
  }
  if (!isAwake) {
    console.error(
      `Failed to wake up the service after ${MaxPingRetries} attempts, exiting. Last error:`,
      lastError,
    );
    await client.close();
    throw new Error("Failed to wake up the service");
  }
}
