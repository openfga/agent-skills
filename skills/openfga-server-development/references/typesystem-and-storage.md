# Typesystem and Storage

## Typesystem and validation workflow

The `TypeSystem` in `pkg/typesystem/typesystem.go` combines:

- type definitions and relation rewrites;
- direct type restrictions and conditions;
- tuple-to-userset relation metadata;
- authorization-model and weighted graphs;
- memoized relation information.

For models from requests or storage, use the validated construction path. `NewAndValidate` validates names, relations, type restrictions, cycles, schema support, and conditions before attaching graphs. Do not move graph construction ahead of validation.

When semantics change:

1. Add malformed and valid-neighbor tests in `pkg/typesystem/`.
2. Update `internal/validation/` if tuple/read/write/context checks are affected.
3. Check authorization graph and weighted-graph construction.
4. Test query behavior across Check, ListObjects, and ListUsers.
5. Benchmark model construction or traversal if the hot path changed.

Keep schema-version behavior explicit and backwards compatible. A model accepted by write but unusable at query time is a correctness defect.

## Storage contract

`pkg/storage/storage.go` defines `OpenFGADatastore` from:

- relationship tuple read/write;
- authorization model read/write;
- stores;
- assertions;
- tuple changelog;
- readiness and cleanup.

Read method comments as normative contracts. They specify not-found behavior, transaction expectations, ordering guarantees, pagination, changelog writes, and iterator ownership.

The supported backends are:

- `pkg/storage/memory/`
- `pkg/storage/sqlite/`
- `pkg/storage/mysql/`
- `pkg/storage/postgres/`

Shared SQL behavior lives in `pkg/storage/sqlcommon/`. Wrappers in `pkg/storage/storagewrappers/` add bounding, caching, contextual tuples, context behavior, model caching, and shared iterators.

## Interface-change checklist

1. Add the contract test first in `pkg/storage/test/`.
2. Update `pkg/storage/storage.go`.
3. Update memory, SQLite, MySQL, and PostgreSQL.
4. Update `sqlcommon` and every wrapper that embeds or narrows the interface.
5. Regenerate `internal/mocks/mock_storage.go` with `make generate-mocks`.
6. Add backend-specific tests only for behavior not expressible in the conformance suite.
7. Run `make test-storage`.
8. Run matrix tests if query results can change.

Each backend invokes `pkg/storage/test.RunAllTests`; do not allow one backend to bypass the shared contract.

## Migrations

Persistent schema migrations live under:

- `assets/migrations/mysql/`
- `assets/migrations/postgres/`
- `assets/migrations/sqlite/`

For a schema change:

- inspect each engine's existing sequence and `pkg/storage/migrate/migrate.go`;
- append a zero-padded, sequential Goose migration with the required up/down markers for every affected engine;
- do not edit a migration that may have shipped;
- preserve upgrade behavior from existing data, not only clean installs;
- consider indexes, collation, lock duration, table scans, and maintenance-window requirements;
- add migration tests in `pkg/storage/migrate/` and backend behavior tests;
- document operator action in a focused runbook when migration risk warrants it.

Do not assume SQL syntax, index behavior, collation, or sequence numbers are interchangeable across engines.

## Pagination and continuation tokens

Use `storage.NewPaginationOptions`; the default page size and token behavior are shared contracts.

- Respect caller page size limits.
- Fetch only enough data to determine the next token.
- Preserve documented ordering where pagination depends on it.
- Validate malformed tokens and map them to the public invalid-token error.
- Keep token encoding/serialization opaque to clients.
- Test first, middle, final, empty, malformed, and filtered pages on every backend.

Representative command paths are `pkg/server/commands/read.go`, `read_changes.go`, and `list_stores.go`. Token interfaces live in `pkg/encoder/`.

## Reliability and datastore semantics

- Writes must be transactional and update the tuple changelog as documented.
- Keep store/model IDs in every lookup and cache key.
- Preserve consistency options through wrappers and backends.
- Stop iterators on all early returns.
- Bound reads and avoid loading unbounded result sets.
- Test concurrent writes, duplicate inserts, missing deletes, cancellation, readiness, and close behavior when affected.
- Treat case sensitivity and collation as authorization correctness, not presentation.
