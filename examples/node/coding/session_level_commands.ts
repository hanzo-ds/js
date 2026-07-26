import { createClient } from "@hanzo-ds/client";
import * as crypto from "node:crypto";

// Note that session will work as expected ONLY if you are accessing the Node directly.
// If there is a load-balancer in front of Datastore nodes, the requests might end up on different nodes,
// and the session will not be preserved. As a workaround for Datastore Cloud, you could try replica-aware routing.
// See https://docs.hanzo.ai/datastore/manage/replica-aware-routing.
const client = createClient({
  // with session_id defined, SET and other session commands
  // will affect all the consecutive queries
  session_id: crypto.randomUUID(),
});

await client.command({
  query: `SET output_format_json_quote_64bit_integers = 0`,
  datastore_settings: { wait_end_of_query: 1 },
});

// this query uses output_format_json_quote_64bit_integers = 0
const rows1 = await client.query({
  query: `SELECT toInt64(42)`,
  format: "JSONEachRow",
});
console.log(await rows1.json());

await client.command({
  query: `SET output_format_json_quote_64bit_integers = 1`,
  datastore_settings: { wait_end_of_query: 1 },
});

// this query uses output_format_json_quote_64bit_integers = 1
const rows2 = await client.query({
  query: `SELECT toInt64(144)`,
  format: "JSONEachRow",
});
console.log(await rows2.json());

await client.close();
