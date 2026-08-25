# Reliability and Security

## Timeouts and cancellation

Set both transport-level and operation-level bounds. A retry budget without a total deadline can multiply latency beyond the caller's budget.

- **JavaScript/TypeScript:** configure Axios transport timeout/abort behavior through `baseOptions` or an injected Axios instance; there is no dedicated SDK cancellation-token parameter.
- **Go:** pass the request's `context.Context`, normally derived with `context.WithTimeout`.
- **Python:** configure `timeout_millisec`; async callers use task cancellation or an async timeout.
- **Java:** set connect/read timeouts and bound or cancel returned `CompletableFuture` work at the application layer.
- **.NET:** configure the injected `HttpClient` timeout and propagate `CancellationToken`.

Do not replace caller cancellation with a background context or default token.

## Retries and errors

Use the official SDK's bounded retry policy where possible. Retry transient network failures, rate limits, and server failures only within the caller's deadline; honor a valid `Retry-After`. Add jitter when implementing a policy directly.

Do not retry:

- invalid store/model/type/relation or malformed context;
- authentication or authorization failures to the OpenFGA endpoint;
- a write whose outcome is unknown unless duplicate/missing behavior makes replay safe or reconciliation exists;
- an item error in BatchCheck without classifying that item.

Classify outcomes separately:

| Outcome | Application handling |
|---|---|
| `allowed: true` | Continue with the authorized action |
| `allowed: false` | Deny without treating it as an infrastructure fault |
| Validation/configuration error | Fail the operation and alert on integration defects |
| Auth error | Fail closed and surface credential/deployment failure |
| Rate limit/transient server/network error | Retry within budget, then fail closed |
| Timeout/cancellation | Stop work and preserve caller cancellation |

Never catch every exception and return `false`: that hides outages as user denials and destroys useful telemetry.

## Pagination and batching

Read, ListStores, and ReadAuthorizationModels use continuation tokens; preserve the same filters, follow tokens until the terminal empty token, and cap total work. Authorization models are returned in reverse chronological order. Do not assume list order is otherwise stable.

ReadChanges is different: when no newer changes exist, it returns the same continuation token rather than an empty token; an empty token is expected only when the store has never had tuple changes. Stop a historical scan when no changes are returned or the token no longer advances, persist that cursor, and use it for later polling.

ListObjects and ListUsers do not paginate. ListObjects has a streaming API, but streams remain bounded by server deadlines. Design UX and data retrieval accordingly.

BatchCheck SDKs may chunk requests. Keep correlation IDs opaque and unique, inspect each item for `allowed` or `error`, and retain the caller deadline across chunks.

A server Write request accepts up to 100 total unique tuple operations. If a larger SDK write disables transactions, record chunk progress and reconcile partial success.

## Metadata and observability

The API has no generic request-metadata body and no canonical application correlation header. BatchCheck has only item-level `correlation_id`.

Official SDKs support default/custom HTTP headers. Add tracing or request IDs only when supported by the deployment gateway and observability policy. Never put PII, tuple contents, tokens, or resource names into correlation IDs or headers.

Record:

- operation name, status class, latency, retry count, and timeout/cancellation;
- non-secret store/model identifiers or safely truncated hashes when policy allows;
- BatchCheck counts and per-item error classes, not sensitive identifiers;
- tuple mutation operation IDs from the application workflow, not tuple contents.

## Idempotency and reconciliation

OpenFGA does not define an API idempotency key. Build idempotency around tuple state:

- use `on_duplicate: ignore` for replayable creates;
- use `on_missing: ignore` for replayable deletes;
- keep an application operation/outbox ID and mark completion only after a known response;
- read or derive expected state and reconcile after unknown outcomes;
- keep transactional mode for multi-tuple invariants.

Ignoring conflicts is a business decision, not a blanket error-handling setting. A conditional tuple with different condition data is not the same duplicate.

## Caching

Do not add an application authorization-decision cache by default. Computed relationships make exact invalidation difficult, and stale allows can expose data.

If requirements justify caching, document:

1. Cache key, including store ID, model ID, user, relation, object, and all contextual/condition inputs.
2. Short bounded TTL and maximum size.
3. Invalidation source: the same domain mutation/outbox or a ReadChanges consumer.
4. Behavior for revocation, model rollout, and consumer lag.
5. Whether sensitive actions perform a final Check.
6. Why stale allow risk is acceptable.

Changing the model ID must make old entries unreachable.

## Least-data exposure

- Prefer Check over enumeration.
- Keep PII and secrets out of tuple identifiers and condition context.
- Keep profiles, metadata, and search indexes in their systems of record.
- Return only application records the caller is authorized to see; do not expose raw authorization graphs in user-facing APIs.
- Avoid ListUsers in health checks, routine logging, analytics, or client-side filtering.
- Apply application-level access control to any administrative tuple or model endpoint.

## Source pointers

- [Tuple API best practices](https://openfga.dev/docs/getting-started/tuples-api-best-practices)
- [Source of truth](https://openfga.dev/docs/best-practices/source-of-truth)
- [Consistency and caching](https://openfga.dev/docs/interacting/consistency)
- [ReadChanges API contract](https://github.com/openfga/api/blob/main/openfga/v1/openfga_service.proto)
- [Official SDK repositories](sdk-source-map.md)
