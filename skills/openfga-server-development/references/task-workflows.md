# Task Workflows

## Add or change an endpoint

1. Decide whether the wire contract changes. If yes, begin in `openfga/api` and consume its generated module update.
2. Add failing command and handler tests.
3. Implement reusable logic in `pkg/server/commands/`.
4. Implement the transport adapter in `pkg/server/`.
5. Add public error conversion.
6. Add the API method and access-control relation mapping; test unauthorized and authorized callers.
7. Verify gRPC and HTTP behavior, validation, headers, telemetry, consistency, and pagination.
8. Add functional and matrix coverage where applicable.
9. Run unit, matrix, lint, and any Docker/startup tests.

## Change resolver or authorization semantics

1. Write a truth table for direct, userset, wildcard, TTU, recursive, intersection, exclusion, conditions, and contextual tuples as applicable.
2. Trace both the standard `internal/graph` engine and the weighted-graph `internal/check` engine; identify whether the semantic exists in both.
3. Add failing narrow tests to every affected engine.
4. Add one shared matrix stage with positive and negative Check/ListObjects/ListUsers assertions.
5. Preserve circular delegation in the standard engine and preserve weighted-graph strategy/model assumptions in the new engine.
6. Preserve request cloning, metadata, depth, cancellation, iterator cleanup, and bounded fan-out.
7. Test caches, consistency, terminal-error classification, fallback, shadow agreement, and throttling if the path touches them.
8. Run unit and matrix tests with the race detector.
9. Add benchmark/allocation evidence if dispatch, datastore work, or hot-path structures changed.

## Change typesystem or validation

1. Add malformed-input tests and valid neighboring cases.
2. Update model construction/validation and tuple validation together where required.
3. Keep validation before graph construction.
4. Test persisted models, model writes, contextual tuples, conditions, and schema versions affected.
5. Add cross-API semantic tests.
6. Benchmark construction or traversal if the hot path changed.

## Change the storage interface or backend behavior

1. Add the contract to `pkg/storage/test/`.
2. Update the interface and regenerate mocks.
3. Implement memory, SQLite, MySQL, and PostgreSQL.
4. Update `sqlcommon` and every storage wrapper.
5. Add migrations for each affected persistent engine and upgrade-path tests.
6. Test transactions, changelog writes, pagination/tokens, consistency, ordering, case sensitivity, concurrency, iterator cleanup, readiness, and close behavior as applicable.
7. Run storage and matrix tests; run Docker tests when startup/image behavior changes.

## Add a config flag or experimental feature

1. Choose a safe default and rollout strategy.
2. Update `pkg/server/config/` and its validation/default tests.
3. Update `.config-schema.json`.
4. Add Cobra flag and Viper/environment bindings.
5. Add the server option/state and startup wiring.
6. Test flag, environment, config file, invalid combinations, default behavior, and enabled behavior.
7. Ensure secrets are redacted.
8. Add a changelog entry and operator-facing docs.

## Change authentication or API authorization

1. Add negative tests first: missing credentials, malformed credentials, wrong audience/issuer/key, and authenticated-but-forbidden callers.
2. Update authenticator and middleware claim propagation.
3. Update access-control method/relation mapping and store/module scoping.
4. Keep configuration errors fatal and runtime checks fail-closed.
5. Verify no secrets enter logs, traces, errors, or serialized config.
6. Run unit, server authorization, functional, and startup/config tests.

## Make a performance-sensitive change

1. Define the workload and expected improvement.
2. Capture a same-environment baseline with allocations.
3. Lock down answers with unit, negative, matrix, and race tests.
4. Implement without weakening limits, cancellation, consistency, or metadata.
5. Re-run the same benchmark with multiple samples.
6. Explain changes in latency, allocations, dispatches, datastore queries/items, and contention.
7. Run `make test-bench`, affected suites, and lint.
8. Document regressions or tradeoffs; do not report an incomparable run as a win.
