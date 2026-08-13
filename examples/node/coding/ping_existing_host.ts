// This example assumes that you have a Datastore server running locally
// (for example, from our root docker-compose.yml file).
//
// Illustrates a successful ping against an existing host and how it might be handled on the application side.
// Ping might be a useful tool to check if the server is available when the application starts,
// especially with Datastore Cloud, where an instance might be idling and will wake up after a ping.
//
// See also:
//  - `ping_non_existing_host.ts` - ping against a host that does not exist.
//  - `../troubleshooting/ping_timeout.ts` - Node.js-only ping timeout example.
import { createClient } from "@hanzo/datastore-client";

const client = createClient({
  url: process.env["DATASTORE_URL"], // defaults to 'http://localhost:8123'
  password: process.env["DATASTORE_PASSWORD"], // defaults to an empty string
});
const pingResult = await client.ping();
if (pingResult.success) {
  console.log("[ExistingHostPing] Ping to the existing host is successful");
} else {
  console.error(
    "[ExistingHostPing] Ping expected to succeed, but got:",
    pingResult,
  );
}
await client.close();
