import { createClient } from "@hanzo-ds/client-web";

if (typeof DATASTORE_CLUSTER_URL === "undefined") {
  throw new Error("DATASTORE_CLUSTER_URL is required");
}

// Datastore cluster - for example, as defined in our `docker-compose.yml`
// (services `datastore1`/`datastore2` behind the `nginx` round-robin entrypoint on port 8127).
const client = createClient({
  url: DATASTORE_CLUSTER_URL,
});

await client.command({
  // Sample macro definitions are located in `.docker/datastore/cluster/serverN_config.xml`
  query: `
    CREATE TABLE IF NOT EXISTS datastore_js_examples_local_cluster_table
    ON CLUSTER '{cluster}'
    (id UInt64, name String)
    ENGINE ReplicatedMergeTree(
      '/datastore/{cluster}/tables/{database}/{table}/{shard}',
      '{replica}'
    )
    ORDER BY (id)
  `,
  // Recommended for cluster usage.
  // By default, a query processing error might occur after the HTTP response was sent to the client.
  // See https://docs.hanzo.ai/datastore/en/interfaces/http/#response-buffering
  datastore_settings: {
    wait_end_of_query: 1,
  },
});

await client.close();
