# Resolver and Concurrency Safety

## Two Check engines

OpenFGA currently has two structurally different Check engines:

- `internal/graph` evaluates protobuf userset rewrites through `CheckResolver` implementations composed by `internal/graph/builder.go`.
- `internal/check` evaluates weighted authorization-model graph nodes and edges through its own resolver/strategy contracts, reached from `pkg/server/commands/check.go`.

They are not interchangeable interfaces. Before changing Check semantics, trace both implementations and the selection, shadow, terminal-error, and fallback logic in `pkg/server/check.go`. Mirror a fix where both engines implement the behavior, and add engine-specific plus server-level agreement tests.

## Standard resolver-chain contract

The Check chain is built in `internal/graph/builder.go` from least to most resource-intensive:

```text
[CachedCheckResolver]?
  -> [DispatchThrottlingCheckResolver]?
  -> [ShadowResolver | LocalChecker]
  -> first resolver again
```

The last resolver delegates back to the first. This circularity lets recursive child checks re-enter cache/throttling behavior, but it also makes accidental infinite delegation easy.

Every `CheckResolver` implementation in `internal/graph/interface.go` must:

- implement `ResolveCheck`, `SetDelegate`, `GetDelegate`, and `Close`;
- delegate only when progress has been made;
- preserve all request fields and response metadata;
- enforce depth and dispatch accounting;
- avoid delegating to itself without a terminating condition;
- release owned resources from `Close`.

Update builder order/options and `internal/graph/builder_test.go` when adding a resolver. Exercise every enabled/disabled composition, including a one-resolver self-loop.

The weighted-graph engine does not use this circular builder. Its sources include:

- `internal/check/interface.go`
- `internal/check/check.go`
- `internal/check/default.go`
- `internal/check/recursive.go`
- `internal/check/weight2.go`
- `internal/check/bottom_up.go`
- `internal/check/strategies.go`
- `internal/modelgraph/`

Preserve its request/response metadata, model-graph assumptions, planner/strategy selection, and cancellation behavior independently.

## Recursive resolution

Before altering `LocalChecker`, recursive, weight-two, or optimized resolvers:

1. Identify the set operation: direct, union, intersection, exclusion, userset, tuple-to-userset, or recursive edge.
2. State its safe short-circuit condition.
3. Preserve request cloning. Child goroutines must not mutate shared request fields.
4. Carry store, model, contextual tuples, context, consistency, cache invalidation time, depth, dispatch counter, and selected strategy.
5. Keep cycle detection and partial metadata meaningful on errors.
6. Add positive, negative, cycle, depth, cancellation, and cross-API tests.

Relevant sources:

- `internal/check/`
- `internal/graph/check.go`
- `internal/graph/default_resolver.go`
- `internal/graph/recursive_resolver.go`
- `internal/graph/weight_two_resolver.go`
- `internal/graph/resolve_check_request.go`
- `internal/modelgraph/`
- `internal/planner/`

## Goroutines and cancellation

Follow existing structured patterns:

- derive cancellable contexts for child work;
- cancel when a result short-circuits or the parent exits;
- always wait for worker pools before returning;
- close channels from the producer side;
- make sends cancellation-aware;
- recover and surface panics consistently where concurrent workers require it;
- avoid retaining request-scoped objects after completion.

An upstream cancellation is not a valid empty or denied result. Return the mapped context error.

Test with the race detector through the Make targets. Add a leak/deadlock regression test when changing channel, iterator, semaphore, or pool ownership.

## Iterators and datastore work

Storage iterators require explicit cleanup:

- consume to completion or call `Stop`;
- treat iterator completion/cancellation with `storage.IterIsDoneOrCancelled`;
- never discard a non-terminal storage error;
- do not start unbounded reads or goroutines per tuple;
- preserve configured concurrency and datastore throttling limits.

Context propagation to the datastore is configurable. By default, `storagewrappers.ContextTracerWrapper` strips request cancellation from datastore queries to avoid connection-pool churn. Changing this behavior requires startup/server tests and evidence that cancellation cannot deadlock or drain the pool.

## Performance-sensitive correctness

Dispatch count, datastore query/item count, throttling, selected strategy, cycles, and cache behavior are operational contracts. When an optimization changes them:

- retain accurate metadata on success and failure;
- compare answers before comparing latency;
- benchmark representative high-cardinality and recursive cases;
- report allocations;
- include contention/cancellation cases where concurrency changed.
