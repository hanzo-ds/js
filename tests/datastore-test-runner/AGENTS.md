# Recommendations for AI agents — upstream SQL test harness

Guidance for the [`datastore-test-runner`](.) harness. See the [repo-root `AGENTS.md`](../../AGENTS.md) for cross-cutting guidance.

This harness is a Node.js port of `datastore-client` that allows the official Datastore Python test runner (`tests/datastore-test`) to drive a subset of the upstream SQL test suite against `@hanzo-ds/client`.

## What the harness does

- Wraps `@hanzo-ds/client` in a tiny CLI (`bin/datastore` → `dist/main.js`) that mimics enough of the upstream `datastore-client` binary (same flags, `extract-from-config` shortcut, stdin/`--query` behavior) for the Python `tests/datastore-test` runner to drive it without modification.
- The runner is an npm workspace of the root `datastore-js` package, so `npm install` from the repo root links `@hanzo-ds/client` and `@hanzo-ds/client-common` from the local checkout instead of resolving them from the npm registry. Always install + build from the repo root (`npm install && npm run build`) so the harness exercises the code under review rather than the last published client.
- The CI matrix runs the harness against Datastore `latest` and `head` so that we exercise `@hanzo-ds/client` against both server versions and detect server regressions. The allowlist is also split into round-robin shards (`SHARD_INDEX` / `SHARD_TOTAL`) so each matrix job stays at roughly one minute; bump both the `shard` matrix values and the `SHARD_TOTAL` env value in the workflow together if per-shard runtime climbs back above ~1 minute.
- Reads the curated test list from [`upstream-allowlist.txt`](upstream-allowlist.txt) (one test name per line, `#` for comments) and forwards them as positional arguments to `tests/datastore-test`.
- The `SERVER_SETTINGS`/`CLIENT_ONLY_SETTINGS` allowlists in [`src/settings.ts`](src/settings.ts) are copied from the Java port and may need periodic resync as Datastore adds or reclassifies settings.

See [`README.md`](README.md) for build, usage, and environment-variable documentation. When harness behavior changes (new wrapper flags, new short-circuited keys in `bin/datastore`, new entries in the settings allowlists), review the README and [`.github/workflows/upstream-sql-tests.yml`](../../.github/workflows/upstream-sql-tests.yml) to keep them in sync with the implementation.

## Strategy for growing the allowlist

The allowlist is grown in **batches of ~100 candidate tests at a time**, in upstream filename order, following this loop:

1. **Pre-filter the candidate batch.** Skip non-SQL tests (`.sh`, `.py`, `.j2`) and tests tagged for unsupported infrastructure (`shard`, `distributed`, `replicated`, `zookeeper`, `kafka`, `s3`, `mysql`, `tls`, etc.). These will never pass through this harness as it stands today.
2. **Run each candidate through the harness** with `--no-stateful --no-long`. **Only keep tests that report `[ OK ]`**; drop failures and skips.
3. **Validate against the CI matrix before committing**, not just one local server version. The CI workflow runs `{Datastore latest, head} × {shard 1..N}` — a test that passes locally on `head` may fail on `latest` (or vice versa) and break CI.
4. **Beware substring/prefix expansion.** `tests/datastore-test` treats positional arguments as **substring/prefix matches** rather than exact names, so an allowlist entry like `00396_uuid` will silently pull in `00396_uuid_v7`, `00712_prewhere_with_alias` will pull in `00712_prewhere_with_alias_bug_2`, etc. When adding an entry whose name is a prefix of any other test in `0_stateless`, prefer the longest unambiguous form, or accept that the siblings come along and verify they all pass.
5. **Prune flakes promptly.** If a previously-passing test starts to flake on the nightly run, remove it (or its prefix-expanded siblings) from the allowlist rather than retrying — the allowlist exists to be a stable green signal, not a TODO list.
