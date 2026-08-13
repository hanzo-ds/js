import { createClient } from "@hanzo/datastore-client-web";

// This example targets Datastore Cloud and requires credentials. When they are
// not provided (e.g. CI runs without cloud secrets, such as Dependabot PRs),
// skip the example instead of failing so the rest of the examples still run.
if (
  typeof DATASTORE_CLOUD_URL === "undefined" ||
  !DATASTORE_CLOUD_URL ||
  typeof DATASTORE_CLOUD_PASSWORD === "undefined" ||
  !DATASTORE_CLOUD_PASSWORD
) {
  console.warn(
    "Skipping create_table_cloud example: set DATASTORE_CLOUD_URL and " +
      "DATASTORE_CLOUD_PASSWORD to run it against Datastore Cloud.",
  );
} else {
  const client = createClient({
    url: DATASTORE_CLOUD_URL,
    password: DATASTORE_CLOUD_PASSWORD,
  });

  // Note that ENGINE and ON CLUSTER clauses can be omitted entirely here.
  // Datastore cloud will automatically use ReplicatedMergeTree
  // with appropriate settings in this case.
  await client.command({
    query: `
      CREATE TABLE IF NOT EXISTS datastore_js_example_cloud_table_web
      (id UInt64, name String)
      ORDER BY (id)
    `,
    // Recommended for cluster usage to avoid situations
    // where a query processing error occurred after the response code
    // and HTTP headers were sent to the client.
    // See https://docs.hanzo.ai/datastore/en/interfaces/http/#response-buffering
    datastore_settings: {
      wait_end_of_query: 1,
    },
  });

  await client.close();
}
