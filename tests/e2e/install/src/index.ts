const assert = require("assert");
const { createClient } = require("@hanzo/datastore-client");
const version = require("@hanzo/datastore-client/dist/version");

async function main() {
  const expectedVersion = process.env.EXPECTED_VERSION;
  assert.ok(
    expectedVersion,
    "EXPECTED_VERSION environment variable must be set to the published version",
  );

  console.log(`Expected published version: ${expectedVersion}`);
  console.log(`Installed @hanzo/datastore-client version: ${version.default}`);

  assert.strictEqual(
    version.default,
    expectedVersion,
    "Installed version should match the version published by the workflow",
  );

  assert.strictEqual(
    typeof createClient,
    "function",
    "createClient should be a function",
  );
  assert.ok(createClient(), "createClient should return a client instance");
}

main();
