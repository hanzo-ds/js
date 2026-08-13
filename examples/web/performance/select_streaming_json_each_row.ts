// Web port of `node/performance/select_streaming_json_each_row.ts`.
//
// Can be used for consuming large datasets to reduce memory overhead, or when
// the response would otherwise be too large to materialize as a single string
// or array via `rows.text()` / `rows.json()`.
//
// In the Web client, `rows.stream()` returns a `ReadableStream<Row[]>`. Each
// chunk pushed downstream is a small array of `Row` objects (the size of the
// array depends on the size of a particular network chunk the client receives
// from the server, and on the size of an individual row).
//
// The following JSON formats can be streamed (note "EachRow" in the format
// name, with JSONObjectEachRow as an exception to the rule):
//  - JSONEachRow
//  - JSONStringsEachRow
//  - JSONCompactEachRow
//  - JSONCompactStringsEachRow
//  - JSONCompactEachRowWithNames
//  - JSONCompactEachRowWithNamesAndTypes
//  - JSONCompactStringsEachRowWithNames
//  - JSONCompactStringsEachRowWithNamesAndTypes
//
// See other supported formats for streaming:
// https://docs.hanzo.ai/datastore/en/integrations/language-clients/javascript#supported-data-formats
//
// NB: There might be confusion between JSON as a general format and the
// Datastore JSON format (https://docs.hanzo.ai/datastore/en/sql-reference/formats#json).
// The client supports streaming JSON objects with JSONEachRow and other
// JSON*EachRow formats (see the list above); it's just that the Datastore JSON
// format and a few others are represented as a single object in the response
// and cannot be streamed by the client.
import { createClient } from "@hanzo/datastore-client-web";

const client = createClient();
const rows = await client.query({
  query: "SELECT number FROM system.numbers_mt LIMIT 5",
  format: "JSONEachRow", // or JSONCompactEachRow, JSONStringsEachRow, etc.
});
const stream = rows.stream();
const reader = stream.getReader();
try {
  while (true) {
    const { done, value: chunk } = await reader.read();
    if (done) break;
    chunk.forEach((row) => {
      console.log(row.json()); // or `row.text` to avoid parsing JSON
    });
  }
  console.log("Completed!");
} finally {
  reader.releaseLock();
}
await client.close();
