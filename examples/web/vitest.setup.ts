// Web examples read connection details from ambient globals (the bundler-injected
// pattern they would use in a real browser app). When running them under Vitest,
// expose the corresponding env values on `globalThis` so the bare identifiers
// resolve.
const g = globalThis as Record<string, unknown>;

g["DATASTORE_CLUSTER_URL"] =
  import.meta.env["DATASTORE_CLUSTER_URL"] ?? "http://localhost:8127";
g["DATASTORE_CLOUD_URL"] = import.meta.env["DATASTORE_CLOUD_URL"];
g["DATASTORE_CLOUD_PASSWORD"] = import.meta.env["DATASTORE_CLOUD_PASSWORD"];
