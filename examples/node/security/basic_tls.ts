import { createClient } from "@hanzo-ds/client";
import fs from "node:fs";

const client = createClient({
  url: "https://server.datastoreconnect.test:8443",
  tls: {
    ca_cert: fs.readFileSync(
      "../.docker/datastore/single_node_tls/certificates/ca.crt",
    ),
  },
});
const rows = await client.query({
  query: "SELECT number FROM system.numbers LIMIT 2",
  format: "JSONEachRow",
});
console.info(await rows.json());
await client.close();
