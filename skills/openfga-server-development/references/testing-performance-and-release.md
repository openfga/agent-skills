# Testing, Performance, and Release

## TDD loop

1. Add the smallest test that expresses the contract.
2. Run it and observe the expected failure.
3. Implement the change.
4. Re-run the focused test.
5. Add negative, boundary, cancellation, and cross-API cases.
6. Refactor only while the contract stays green.

Use the Makefile as the source of truth:

```bash
make test FILTER='^TestName$'
```

`make test` regenerates mocks and runs Go tests with the race detector, atomic cross-package coverage, a fresh count, and a timeout.

## Validation tiers

Current CI splits the suite for parallelism:

```bash
make test-unit
make test-storage
make test-matrix
make test-docker
make lint
```

- `test-unit`: fast packages excluding storage integrations, matrix tests, and selected command packages.
- `test-storage`: memory, SQLite, MySQL, PostgreSQL, and migration packages.
- `test-matrix`: `tests/...`, `cmd/run/...`, and `cmd/validatemodels/...`.
- `test-docker`: Docker image and CLI/startup behavior under the `docker` build tag.
- `lint`: golangci-lint v2 plus configured formatters; it auto-fixes.

Run the tiers affected by the change. Use full `make test` for cross-package coverage or before finalizing broad changes.

## Which test belongs where

| Change | Primary test location |
|---|---|
| Command business rule | Matching `pkg/server/commands/*_test.go` |
| Handler validation/wiring | Matching `pkg/server/*_test.go` |
| Public functional API behavior | `tests/functional_test.go` |
| Query semantics | Shared YAML fixtures plus Check/ListObjects/ListUsers runners |
| Standard resolver algorithm | Matching `internal/graph/*_test.go` and matrix tests |
| Weighted-graph Check algorithm | Matching `internal/check/*_test.go`, server flag/fallback tests, and agreement cases |
| Model validation | `pkg/typesystem/*_test.go`, `internal/validation/*_test.go` |
| Storage interface | `pkg/storage/test/` conformance suite |
| Backend-specific SQL | Backend package tests |
| Flag/startup wiring | `cmd/run/run_test.go`, `pkg/server/config/config_test.go`, `pkg/server/server_test.go` |
| HTTP headers | `TestHTTPHeaders` in `cmd/run/run_test.go` |

## Performance evidence

Performance-sensitive CI paths include `internal/graph`, `internal/listobjects`, `internal/check`, `internal/planner`, `internal/iterator`, `internal/containers`, core storage/SQL code, commands, and typesystem code.

For a performance claim:

1. Select or add a representative benchmark close to the changed code.
2. Record a baseline on the same machine and conditions.
3. Run enough samples to distinguish signal from noise.
4. Report `ns/op`, `B/op`, and `allocs/op`; use `b.ReportAllocs()` for new focused benchmarks.
5. Include realistic cardinality, recursion, contextual tuples, or contention where relevant.
6. Run:

   ```bash
   make test-bench
   ```

The target uses `-benchmem`. CI compares performance-sensitive PRs with a same-hardware main-branch baseline when one is available. A benchmark run without a comparable baseline is evidence of execution, not evidence of no regression.

Never compensate for an incorrect result by calling it an optimization. Run correctness and race tests before interpreting benchmark results.

## Changelog and release

`CHANGELOG.md` follows Keep a Changelog and Semantic Versioning.

- Add a concise user/operator-facing entry under `Unreleased` for normal changes.
- Use the correct section: Added, Changed, Deprecated, Removed, Fixed, or Security.
- Call out experimental behavior and compatibility impact.
- Mark breaking behavior clearly.
- Do not include secrets, exploit details under embargo, or implementation-only noise.
- Current CI exempts only PRs carrying one of its configured skip labels (for example dependencies or tests); do not assume an exemption.

`RELEASES.md` describes release expectations. Breaking changes require the release version policy enforced for release changelog PRs.

Before finalizing a changelog edit, run the current formatter command from `.github/workflows/enforce-changelog-entry.yaml` (currently `npx keep-a-changelog@2.5.3`) and ensure it produces no diff.

## Pull request evidence

The PR should state:

- externally observable behavior and unchanged behavior;
- correctness and negative cases;
- cross-API coverage when semantics changed;
- storage backends/migrations touched;
- config/API compatibility and rollout mode;
- commands run;
- benchmark and allocation comparison for performance changes;
- changelog entry or explicit policy-backed exemption.
