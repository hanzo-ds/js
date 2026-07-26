import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "examples-node",
    include: ["**/*.ts"],
    // Examples are intentionally duplicated across category folders so each
    // category is a self-contained "skill corpus". To keep CI runtime stable,
    // each example runs once from its primary location; secondary copies are
    // excluded below. Keep this list in sync with examples/README.md.
    exclude: [
      "node_modules/**",
      "vitest.config.ts",
      "vitest.setup.ts",
      // Duplicates of `coding/` files
      "performance/async_insert.ts",
      "performance/insert_from_select.ts",
      "troubleshooting/ping_non_existing_host.ts",
      "troubleshooting/custom_json_handling.ts",
      "security/query_with_parameter_binding.ts",
      "security/query_with_parameter_binding_special_chars.ts",
      "schema-and-deployments/insert_ephemeral_columns.ts",
      "schema-and-deployments/insert_exclude_columns.ts",
      "schema-and-deployments/url_configuration.ts",
      // Duplicate of `security/read_only_user.ts`
      "troubleshooting/read_only_user.ts",
      // TODO: stop excluding once @hanzo-ds/client@1.20.0 (which adds the
      //  `tracer` config option) is published to npm.
      "coding/otel_tracing.ts",
    ],
    setupFiles: ["vitest.setup.ts"],
    pool: "forks",
    testTimeout: 60_000,
    hookTimeout: 60_000,
    passWithNoTests: true,
    reporters: ["verbose"],
    env: {
      DATASTORE_URL: process.env["DATASTORE_URL"] ?? "http://localhost:8123",
      DATASTORE_PASSWORD: process.env["DATASTORE_PASSWORD"] ?? "",
      DATASTORE_CLUSTER_URL:
        process.env["DATASTORE_CLUSTER_URL"] ?? "http://localhost:8127",
    },
  },
});
