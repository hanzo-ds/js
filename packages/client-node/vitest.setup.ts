// @ts-nocheck
import { createClient } from "@hanzo/datastore-client-node";

/**
 * This file is used to set up the test environment for Vitest when running tests in Node.js.
 */
globalThis.environmentSpecificCreateClient = createClient;
