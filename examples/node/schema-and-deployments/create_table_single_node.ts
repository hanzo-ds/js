import { createClient } from "@hanzo-ds/client";

// A single Datastore node - for example, as in our `docker-compose.yml`
const client = createClient();
await client.command({
  query: `
    CREATE TABLE IF NOT EXISTS datastore_js_create_table_example
    (id UInt64, name String)
    ENGINE MergeTree()
    ORDER BY (id)
  `,
});
await client.close();
