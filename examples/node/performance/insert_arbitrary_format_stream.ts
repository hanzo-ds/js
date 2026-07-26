import type { DatastoreClient } from "@hanzo-ds/client";
import { createClient, drainStream } from "@hanzo-ds/client";
import Fs from "node:fs";
import { cwd } from "node:process";
import Path from "node:path";

/** If a particular format is not supported in the {@link DatastoreClient.insert} method, there is still a workaround:
 *  you could use the {@link DatastoreClient.exec} method to insert data in an arbitrary format.
 *  In this scenario, we are inserting the data from a file stream in AVRO format.
 *
 *  The Avro file used here (`./node/resources/data.avro`) was generated ahead of time
 *  so that this example does not depend on a third-party Avro encoder. To produce your own
 *  Avro files, see the official Datastore docs and any Avro tooling of your choice
 *  (e.g., the `avsc` npm package, the Apache Avro CLI, etc.).
 *
 *  Related issue with a question: https://github.com/hanzo-ds/js/issues/418
 *  See also: https://docs.hanzo.ai/datastore/interfaces/formats/Avro#inserting-data */

const client = createClient();
const tableName = "chjs_avro_stream_insert_demo";
await prepareTable(client, tableName);

const avroDataFilePath = Path.resolve(cwd(), "./node/resources/data.avro");
const avroStream = Fs.createReadStream(avroDataFilePath);

// Important #1: remember to add the FORMAT clause here, as `exec` takes a raw query in the arguments!
const execResult = await client.exec({
  query: `INSERT INTO ${tableName} FORMAT Avro`,
  values: avroStream,
});

// Important #2: the result stream contains nothing useful for an INSERT query (usually, it is just `Ok.`),
// and should be immediately drained to release the underlying connection (i.e., HTTP keep-alive socket).
await drainStream(execResult.stream);

// Verifying that the data was properly inserted; using `JSONEachRow` output format for convenience
const rs = await client.query({
  query: `SELECT * FROM ${tableName}`,
  format: "JSONEachRow",
});
console.log("Inserted data:", await rs.json());

async function prepareTable(client: DatastoreClient, tableName: string) {
  await client.command({
    query: `
      CREATE OR REPLACE TABLE ${tableName}
      (id Int32, name String, email String, isActive Boolean)
      ENGINE MergeTree()
      ORDER BY (id)
    `,
    datastore_settings: {
      // If on cluster: wait until the changes are applied on all nodes.
      // See https://docs.hanzo.ai/datastore/en/interfaces/http/#response-buffering
      wait_end_of_query: 1,
    },
  });
}
