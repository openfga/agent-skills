---
name: openfga-server-development
description: Safe OpenFGA server development for the openfga/openfga Go repository. Use when changing HTTP or gRPC handlers, commands, Check/ListObjects/ListUsers graph resolution, typesystem or tuple validation, storage interfaces/backends/migrations, authentication, API authorization, server config or flags, protobuf dependencies, generated mocks, concurrency, pagination, caching, reliability, or performance; when adding endpoints, changing authorization semantics, fixing datastore behavior, or preparing tests, benchmarks, changelog entries, and pull requests.
license: Apache-2.0
metadata:
  author: openfga
  version: "1.0.0"
---

# OpenFGA Server Development

Use this skill for changes to `github.com/openfga/openfga`. It complements the `openfga` modeling skill; it does not replace modeling guidance.

Before editing:

1. Read the repository's current `AGENTS.md`, `CONTRIBUTING.md`, and `Makefile`.
2. Inspect the current implementation and tests for the touched path. The source pointers below are navigation aids, not substitutes for current code.
3. Preserve unrelated work in the checkout.

## Non-negotiable priorities

Apply these in order:

1. **Correctness:** authorization answers and API authorization must be exact.
2. **Reliability:** cancellation, limits, cleanup, errors, and partial failures must remain safe.
3. **Performance:** optimize latency, datastore work, and allocations only after correctness is locked down.

Never accept a speedup that can produce a false allow, false deny, stale answer, cross-store leak, or inconsistent result between query APIs.

## Request path and ownership

The normal path is:

```text
HTTP grpc-gateway or direct gRPC
  -> gRPC middleware
  -> pkg/server handler
  -> pkg/server/commands business logic
  -> graph/list resolution
  -> storage interface and wrappers
  -> backend
```

- HTTP is translated to the same gRPC service in `cmd/run/run.go`; do not create HTTP-only business logic.
- Middleware owns panic recovery, request metadata, timeout, validation, observability, and authentication.
- Handlers own transport validation, API authorization, typesystem resolution, command construction, metrics, and API error conversion.
- Commands own reusable business logic and domain errors.
- Resolvers own graph semantics and resolution metadata.
- Storage implementations own backend behavior while honoring the shared interface contract.

Read [architecture and boundaries](references/architecture-and-boundaries.md) before changing this flow.

## Safety gates

### Authorization semantics

- Start with a failing test that captures the intended allow **and** deny behavior.
- When shared traversal, validation, conditions, recursion, usersets, wildcards, intersections, exclusions, or tuple-to-userset behavior changes, add cross-API coverage for `Check`, `ListObjects`, and `ListUsers`.
- Include negative cases: absent relationships, wrong relation/type, invalid tuples or context, excluded users, cycles, and unauthorized callers as applicable.
- Preserve contextual tuples, consistency preferences, store/model isolation, deadlines, limits, and cache invalidation behavior.
- Keep access-control checks fail-closed and before protected work.

Read [authorization correctness](references/authorization-correctness.md).

### Boundaries and generated code

- If the wire contract changes, begin in `openfga/api`. Do not edit protobuf definitions or `*.pb.go` in `openfga/openfga`.
- Do not hand-edit generated mocks in `internal/mocks/` or generated resolver mocks. Change the source interface and run `make generate-mocks`.
- Keep transport concerns in handlers and reusable logic in commands.
- Convert domain errors at the handler boundary through the endpoint's error converter or `pkg/server/errors`; do not leak backend errors.
- Use the lint-required `openfgav1` and `parser` aliases and the configured import order.

Read [API, config, auth, and generated files](references/api-config-auth-and-generated.md).

### Resolver and concurrency changes

- The Check resolver chain is circular. Every resolver must implement delegation and cleanup without recursively delegating forever.
- Check also has a separate weighted-graph engine under `internal/check`; semantic changes must assess and test both engines and their fallback/shadow behavior.
- Preserve the full request and response metadata across dispatches.
- Bound fan-out. Propagate cancellation deliberately, stop iterators, cancel child work, and wait for worker pools to avoid goroutine or connection leaks.
- Short-circuit only when the set operation proves the final result.
- Treat caching, shadow execution, fallback, and throttling as correctness-sensitive behavior.

Read [resolver and concurrency safety](references/resolver-and-concurrency.md).

### Typesystem and storage changes

- Validate untrusted models before graph construction. Keep parsing, relation metadata, model validation, weighted-graph behavior, and tuple validation aligned.
- A storage interface change requires conformance coverage and implementations for memory, SQLite, MySQL, and PostgreSQL.
- Update wrappers and generated mocks when an interface changes.
- Add migrations for every affected persistent backend; never rewrite a released migration.
- Preserve iterator cleanup, ordering promises, continuation-token semantics, consistency options, changelog writes, and transaction behavior.

Read [typesystem and storage](references/typesystem-and-storage.md).

## Change workflow

1. **Classify the change.** Identify transport, handler, command, resolver, validation, storage, configuration, generated, and release surfaces before editing.
2. **Write the failing test.** Prefer the lowest layer that states the contract; add matrix/functional tests for externally observable semantics.
3. **Implement the smallest complete vertical change.** Update all required backends, wiring, error mapping, authorization mapping, mocks, and schema surfaces.
4. **Run the focused test.**

   ```bash
   make test FILTER='^TestName$'
   ```

5. **Run the affected validation tier.** Use `make test-unit`, `make test-storage`, `make test-matrix`, and/or `make test-docker` according to the touched surfaces.
6. **Run `make lint`.** Inspect its changes because the target uses auto-fix.
7. **Prove performance claims.** Add or update a representative benchmark, capture `-benchmem` results, and compare latency and allocations against a meaningful baseline.
8. **Update `CHANGELOG.md`.** Add a concise entry under `Unreleased` unless the repository's current PR policy explicitly exempts the change.

Use the change-specific checklists in [task workflows](references/task-workflows.md).

## Validation hierarchy

| Scope | Minimum validation |
|---|---|
| Local logic or error mapping | Focused `make test FILTER=...`, then `make test-unit` |
| Handler, command, or API behavior | Unit tests plus `make test-matrix`; add `tests/functional_test.go` coverage when appropriate |
| Authorization semantics | Positive and negative tests plus cross-API matrix assertions for Check/ListObjects/ListUsers |
| Storage contract or SQL behavior | `make test-storage`; exercise all backends and migrations |
| CLI, startup, image, or Dockerfile | `make test-docker` |
| Performance-sensitive paths | Representative benchmark and allocation evidence; finish with `make test-bench` when practical |
| Cross-package/full confidence | `make test` |
| Any Go change | `make lint` after tests |

See [testing, performance, and release](references/testing-performance-and-release.md) for the real target composition and evidence expectations.

## Finish only when

- Tests demonstrate both permitted and denied behavior.
- Query semantics remain aligned across Check, ListObjects, and ListUsers where applicable.
- Every implementation and generated boundary is updated.
- Cancellation, iterator, goroutine, pagination, consistency, and cache behavior are accounted for.
- API errors are stable and safe.
- Performance claims include before/after evidence.
- The changelog and pull request explain behavior, compatibility, and validation.
