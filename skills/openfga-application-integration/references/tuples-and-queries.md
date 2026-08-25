# Tuples and Authorization Queries

## Transactional tuple writes

One server Write request is atomic: all writes and deletes succeed, or all fail. It accepts at most 100 total unique tuples across both collections. Keep one request transactional when replacing access or preserving an invariant.

```json
{
  "writes": {
    "tuple_keys": [
      {
        "user": "user:anne",
        "relation": "reader",
        "object": "document:roadmap"
      }
    ],
    "on_duplicate": "ignore"
  },
  "deletes": {
    "tuple_keys": [
      {
        "user": "user:bob",
        "relation": "reader",
        "object": "document:roadmap"
      }
    ],
    "on_missing": "ignore"
  },
  "authorization_model_id": "MODEL_ID"
}
```

`on_duplicate` and `on_missing` accept lowercase `error` or `ignore`; the default is `error`. Select `ignore` only when the application deliberately wants replay-safe create/delete semantics. A delete identifies user, relation, and object; condition data on a delete is not part of tuple identity.

Do not blindly retry an interrupted write. The server may have committed it even when the client did not receive the response. Use intentional duplicate/missing handling, an application operation record, or reconciliation. SDK bulk modes that disable transactions split data into atomic chunks; later failure can leave earlier chunks committed.

Keep the application database and OpenFGA synchronized through an explicit design:

- **Outbox:** commit the domain change and an authorization event together, then apply/retry it.
- **Reconciliation:** derive expected tuples from the source of truth and repair drift.
- **Compensation:** reverse the domain or tuple change after a known failure.

Never imply that two independent databases commit atomically.

## Check

Use Check when only one decision is required:

```json
{
  "tuple_key": {
    "user": "user:anne",
    "relation": "reader",
    "object": "document:roadmap"
  },
  "authorization_model_id": "MODEL_ID",
  "contextual_tuples": {"tuple_keys":[]},
  "context": {},
  "consistency": "MINIMIZE_LATENCY"
}
```

The response field is `allowed`. A valid query with no path to access returns `false`. An undefined type/relation, invalid context, unavailable model, authentication failure, timeout, or transport failure is an error—not a denial. Keep errors distinct in application control flow and telemetry.

## BatchCheck

Use the server BatchCheck endpoint or the SDK method that maps to it when several decisions share a request boundary:

```json
{
  "checks": [
    {
      "tuple_key": {
        "user": "user:anne",
        "relation": "reader",
        "object": "document:roadmap"
      },
      "contextual_tuples": {"tuple_keys":[]},
      "context": {},
      "correlation_id": "item-1"
    }
  ],
  "authorization_model_id": "MODEL_ID",
  "consistency": "MINIMIZE_LATENCY"
}
```

The raw API returns `result`, keyed by `correlation_id`; each value contains either `allowed` or an item error. Correlation IDs must be unique within the request, 1-36 characters, and contain only word characters, digits, or hyphens. Use opaque generated IDs—never user or resource data.

SDKs may generate IDs, split oversized batches, or return a list instead of the raw map. Confirm that the chosen method is server BatchCheck: some SDKs also offer a client-side helper that issues individual Checks.

## ListObjects and ListUsers

Use ListObjects only when the product needs authorized object IDs:

```json
{
  "type": "document",
  "relation": "reader",
  "user": "user:anne",
  "authorization_model_id": "MODEL_ID",
  "contextual_tuples": {"tuple_keys":[]},
  "context": {},
  "consistency": "MINIMIZE_LATENCY"
}
```

The response is `objects: string[]`. Results are unordered, bounded by server result/deadline settings, and have no continuation token. Streamed ListObjects removes the fixed result cap but remains deadline-bound. All five official SDKs covered by this skill support it; the JavaScript/TypeScript implementation is Node.js-only.

Use ListUsers only when enumerating subjects is necessary:

```json
{
  "object": {"type":"document","id":"roadmap"},
  "relation": "reader",
  "user_filters": [{"type":"user"}],
  "authorization_model_id": "MODEL_ID",
  "contextual_tuples": [],
  "context": {},
  "consistency": "MINIMIZE_LATENCY"
}
```

The current server API requires exactly one `user_filters` element, even though SDK request types represent the field as a collection and some older examples show multiple entries. If the product needs multiple subject types, issue one ListUsers request per filter and combine the results under the same model and consistency policy. Returned users are structured variants: `object`, `userset`, or `wildcard`; they are not plain strings. Results are unordered, bounded, and non-paginated. A returned wildcard does not prove a particular user is allowed when exclusions may apply—Check that user.

## Authorization is not search

OpenFGA stores relationships, not resource records. Keep filtering, text search, sorting, projection, and pagination in the application data store.

Choose one deliberate composition:

1. Query a small application page, BatchCheck it, and continue fetching until the authorized page is full.
2. Use ListObjects when the authorized set is predictably small, then constrain the application query by those IDs.
3. Maintain a local authorization index from change events for candidate generation, then Check before releasing sensitive data.

Do not fetch broad ListUsers/ListObjects results when a Boolean Check would answer the request.

## Contextual tuples, conditions, and consistency

Contextual tuples are ephemeral and request-local. Use them for facts known by the application but not persisted as tuples, not as a hidden second tuple store. They are validated against the pinned model; a matching contextual tuple overrides the stored tuple for that request. A request can contain at most 100 contextual tuples.

Stored conditional tuples use:

```json
{
  "user": "user:anne",
  "relation": "reader",
  "object": "document:roadmap",
  "condition": {
    "name": "non_expired_grant",
    "context": {"expires_at":"2030-01-01T00:00:00Z"}
  }
}
```

Supply request-specific condition parameters in top-level query `context`. Stored condition context and query context are merged, with stored values taking precedence. Persisted conditional-tuple context is limited to 32 KB, and query context shares the server's overall 512 KB request-size limit. Validate types, bound payloads before sending, and avoid secrets or PII.

Consistency values are `MINIMIZE_LATENCY` and `HIGHER_CONSISTENCY` (`UNSPECIFIED` behaves like minimize latency). Use higher consistency selectively for read-after-write flows; it bypasses enabled caches and costs latency/load. There is no write consistency token to pass to a later query.

## Source pointers

- [Update relationship tuples](https://openfga.dev/docs/getting-started/update-tuples)
- [Perform a Check and BatchCheck](https://openfga.dev/docs/getting-started/perform-check)
- [ListObjects](https://openfga.dev/docs/getting-started/perform-list-objects)
- [ListUsers](https://openfga.dev/docs/getting-started/perform-list-users)
- [Contextual tuples](https://openfga.dev/docs/interacting/contextual-tuples)
- [Conditions](https://openfga.dev/docs/modeling/conditions)
- [Consistency](https://openfga.dev/docs/interacting/consistency)
- [Search with permissions](https://openfga.dev/docs/interacting/search-with-permissions)
- [Canonical API definitions](https://github.com/openfga/api/tree/main/openfga/v1)
