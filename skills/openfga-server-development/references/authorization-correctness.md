# Authorization Correctness

Authorization correctness outranks reliability and performance. Treat a semantic change as security-sensitive even when it looks like a refactor.

## Build a truth table first

For each affected relation and request shape, enumerate:

- direct user, userset, and typed wildcard subjects;
- direct, computed, tuple-to-userset, recursive, union, intersection, and exclusion paths;
- contextual versus persisted tuples;
- condition present, missing, invalid, true, and false;
- latest versus explicit authorization model;
- default versus higher consistency;
- cycles, depth limits, deadlines, and throttling;
- correct store/model versus a different store/model.

Write expected allows and denies before changing the implementation.

## Cross-API invariant

When a shared semantic path changes, demonstrate equivalent membership from all supported directions:

- `Check`: whether a subject has a relation to an object.
- `ListObjects`: which objects satisfy that same subject/relation query.
- `ListUsers`: which subjects matching the requested filters satisfy that object/relation query.

Within each API's documented filters, limits, and response contract:

- a positive Check should have the corresponding object/user membership;
- a negative Check should not appear in list results;
- contextual tuples, conditions, usersets, wildcards, intersections, exclusions, and recursive paths must agree.

Use one matrix stage containing `checkAssertions`, `listObjectsAssertions`, and `listUsersAssertions` when possible. Add negative assertions, not only a happy path.

Current shared fixtures and runners:

- `assets/tests/consolidated_1_1_tests.yaml`
- `assets/tests/abac_tests.yaml`
- `tests/check/check.go`
- `tests/listobjects/listobjects.go`
- `tests/listusers/listusers.go`

Add narrow unit tests at the changed layer as well. Matrix coverage does not replace command/resolver tests.

## Validation alignment

Tuple and model validation can change authorization answers:

- `internal/validation/validation.go` validates object/relation shape, tupleset restrictions, type restrictions, conditions, and context.
- `pkg/typesystem/typesystem.go` validates models before attaching authorization and weighted graphs.
- Commands intentionally apply different validation strictness to query tuple keys and contextual/write tuples.

Test both newly rejected input and nearby valid input. A validation fix must not silently disable graph optimization or cause API-specific behavior.

## Caching and consistency

A cache key must include every semantic input that changes an answer, including store/model identity, tuple key, contextual tuples, condition context, and relevant consistency/invalidation state.

- Do not cache incomplete, cancelled, throttled, cycle-tainted, or fallback results unless the existing contract explicitly permits it.
- Test writes followed by reads and invalidation races.
- Preserve `HIGHER_CONSISTENCY` behavior.
- Shadow algorithms compare results; they must not mutate the primary result or share unsafe request state.
- Fallback paths must distinguish terminal validation/deadline errors from safe fallback errors.

Relevant sources include `pkg/storage/cache.go`, `pkg/storage/storagewrappers/`, `internal/graph/cached_resolver.go`, and `pkg/server/check.go`.

## Keep both Check engines aligned

`pkg/server/check.go` can execute either:

- the standard circular resolver chain in `internal/graph`; or
- the feature-gated weighted-graph implementation in `internal/check`, built from `internal/modelgraph` through `pkg/server/commands/check.go`.

Do not assume a standard-path matrix pass proves weighted-graph correctness. For a shared Check semantic:

- locate the corresponding strategy in both engines;
- add focused tests to both packages when both implement the behavior;
- exercise server behavior with weighted-graph and shadow flags enabled;
- verify which errors are terminal and which may fall back;
- assert the primary and shadow algorithms agree on positive and negative cases;
- preserve diagnostic logging that identifies known divergence shapes.

Fallback is not a substitute for fixing a divergent experimental engine, and it must never turn invalid input, cancellation, deadline, or throttling into a retry that changes the public result.

## API authorization

Authentication establishes claims; API authorization decides whether those claims may invoke an operation.

- `internal/middleware/authn/` inserts claims into context.
- `internal/authz/authz.go` maps every API method to an access-control relation.
- Handlers call `checkAuthz` before protected work.

For a new or changed endpoint:

- add the API method mapping;
- preserve store and module scoping;
- test unauthenticated and authenticated-but-unauthorized callers;
- test authorized callers;
- ensure unknown API methods fail closed;
- avoid logging keys, tokens, passwords, or raw security-sensitive context.

Check `pkg/server/server_authz_test.go`, `internal/authz/authz_test.go`, and relevant functional tests.

## Review questions

1. Can this change return true without proving every required branch?
2. Can a short-circuit skip an exclusion, condition, or userset constraint?
3. Can cancellation or a partial iterator look like an empty result?
4. Can cache or shared iterator state cross stores, models, contexts, or users?
5. Does a fallback hide invalid input or a deadline?
6. Are Check, ListObjects, and ListUsers still consistent?
7. Are denies and unauthorized cases explicitly tested?
