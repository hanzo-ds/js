import type {
  DatastoreClient,
  DatastoreSettings,
} from "@hanzo/datastore-client-common";
import { createTable, guid, TestEnv } from "../utils";

export async function createTableWithFields(
  client: DatastoreClient,
  fields: string,
  datastore_settings?: DatastoreSettings,
  table_name?: string,
): Promise<string> {
  const tableName = table_name ?? `test_table__${guid()}`;
  await createTable(
    client,
    (env) => {
      switch (env) {
        // ENGINE can be omitted in the cloud statements:
        // it will use ReplicatedMergeTree and will add ON CLUSTER as well
        case TestEnv.Cloud:
          return `
            CREATE TABLE ${tableName}
            (id UInt32, ${fields})
            ORDER BY (id)
          `;
        case TestEnv.LocalSingleNode:
          return `
            CREATE TABLE ${tableName}
            (id UInt32, ${fields})
            ENGINE MergeTree()
            ORDER BY (id)
          `;
        case TestEnv.LocalCluster:
          return `
            CREATE TABLE ${tableName} ON CLUSTER '{cluster}'
            (id UInt32, ${fields})
            ENGINE ReplicatedMergeTree(
              '/datastore/{cluster}/tables/{database}/{table}/{shard}',
              '{replica}'
            )
            ORDER BY (id)
          `;
      }
    },
    datastore_settings,
  );
  return tableName;
}
