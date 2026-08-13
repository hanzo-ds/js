// @ts-nocheck
import { createClient } from "@hanzo/datastore-client-web";

/**
 * This file is used to set up the test environment for Vitest when running tests in Node.js.
 */
globalThis.environmentSpecificCreateClient = createClient;

// Port to import.meta.env once all modules support ESM
globalThis.process = {
  env: {
    DATASTORE_CLOUD_HOST: import.meta.env.DATASTORE_CLOUD_HOST,
    DATASTORE_CLOUD_PASSWORD: import.meta.env.DATASTORE_CLOUD_PASSWORD,
    DATASTORE_CLOUD_JWT_ACCESS_TOKEN: import.meta.env
      .DATASTORE_CLOUD_JWT_ACCESS_TOKEN,
    DATASTORE_TEST_SKIP_INIT: import.meta.env.DATASTORE_TEST_SKIP_INIT,
    DATASTORE_TEST_ENVIRONMENT: import.meta.env.DATASTORE_TEST_ENVIRONMENT,
  },
};
