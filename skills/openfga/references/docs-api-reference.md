---
title: HTTP API Reference
---

## HTTP API Reference

The SDKs and the `fga` CLI all wrap the same OpenFGA HTTP API. Prefer an SDK for application code (see `sdk-*`), but use the API reference when you need the exact wire format: calling the API directly (curl, `fetch`, an HTTP client in a language without an SDK), building a gateway or proxy, or debugging what an SDK actually sends.

Every endpoint has a reference page at `https://openfga.dev/docs/api/service/<group>/<operation>`. Append `.md` to get the page as Markdown; it embeds the OpenAPI definition for that endpoint (parameters, request body, responses). For example: `https://openfga.dev/docs/api/service/stores/list-all-stores.md`.

### Endpoint Map

All paths are relative to your OpenFGA API URL (for example `http://localhost:8080`). Docs pages are relative to `https://openfga.dev/docs/api/service/`.

| Operation | Method and path | Docs page |
|-----------|-----------------|-----------|
| ListStores | `GET /stores` | `stores/list-all-stores` |
| CreateStore | `POST /stores` | `stores/create-a-store` |
| GetStore | `GET /stores/{store_id}` | `stores/get-a-store` |
| DeleteStore | `DELETE /stores/{store_id}` | `stores/delete-a-store` |
| ReadAuthorizationModels | `GET /stores/{store_id}/authorization-models` | `authorization-models/get-all-authorization-models` |
| WriteAuthorizationModel | `POST /stores/{store_id}/authorization-models` | `authorization-models/create-a-new-authorization-model` |
| ReadAuthorizationModel | `GET /stores/{store_id}/authorization-models/{id}` | `authorization-models/get-an-authorization-model-by-its-id` |
| Write | `POST /stores/{store_id}/write` | `relationship-tuples/add-or-delete-tuples` |
| Read | `POST /stores/{store_id}/read` | `relationship-tuples/get-stored-relationship-tuples` |
| ReadChanges | `GET /stores/{store_id}/changes` | `relationship-tuples/get-all-tuple-changes` |
| Check | `POST /stores/{store_id}/check` | `relationship-queries/check-user-authorization` |
| BatchCheck | `POST /stores/{store_id}/batch-check` | `relationship-queries/check-multiple-authorizations-in-a-single-request` |
| ListObjects | `POST /stores/{store_id}/list-objects` | `relationship-queries/list-objects-a-user-is-related-to` |
| StreamedListObjects | `POST /stores/{store_id}/streamed-list-objects` | `relationship-queries/stream-all-objects-with-a-user-relationship` |
| ListUsers | `POST /stores/{store_id}/list-users` | `relationship-queries/list-all-users-with-a-relationship-to-an-object` |
| Expand | `POST /stores/{store_id}/expand` | `relationship-queries/expand-relationships-in-userset-tree-format` |
| ReadAssertions | `GET /stores/{store_id}/assertions/{authorization_model_id}` | `assertions/get-assertions-for-a-model` |
| WriteAssertions | `PUT /stores/{store_id}/assertions/{authorization_model_id}` | `assertions/upsert-assertions-for-a-model` |

The experimental [AuthZEN](https://openfga.dev/docs/interacting/authzen) endpoints (`/stores/{store_id}/access/v1/...` and `/.well-known/authzen-configuration/{store_id}`) are documented under `authzenservice/`. Only use them when the user explicitly asks for AuthZEN, and confirm the server has the feature enabled.

### Request Essentials

The API reference uses `snake_case` field names, even when an SDK exposes `camelCase` or `PascalCase` properties. Unknown fields are silently ignored, so a typo in an optional field (for example `model_id` instead of `authorization_model_id`) does not fail; validate payloads before sending (see `docs-openapi-validation`).

**Check:**

```bash
curl -sS -X POST "$FGA_API_URL/stores/$FGA_STORE_ID/check" \
  -H "Content-Type: application/json" \
  -d '{
    "authorization_model_id": "'"$FGA_MODEL_ID"'",
    "tuple_key": {
      "user": "user:anne",
      "relation": "can_view",
      "object": "document:roadmap"
    }
  }'
# {"allowed":true,"resolution":""}
```

If the server has authentication enabled, add `-H "Authorization: Bearer $FGA_API_TOKEN"`.

**Write (add and remove tuples in one transaction):**

```json
{
  "authorization_model_id": "01G50QVV17PECNVAHX1GG4Y5NC",
  "writes": {
    "tuple_keys": [
      { "user": "user:anne", "relation": "owner", "object": "document:roadmap" }
    ],
    "on_duplicate": "ignore"
  },
  "deletes": {
    "tuple_keys": [
      { "user": "user:bob", "relation": "owner", "object": "document:roadmap" }
    ],
    "on_missing": "ignore"
  }
}
```

**BatchCheck (results are keyed by `correlation_id`):**

```json
{
  "authorization_model_id": "01G50QVV17PECNVAHX1GG4Y5NC",
  "checks": [
    {
      "correlation_id": "anne-view-roadmap",
      "tuple_key": { "user": "user:anne", "relation": "can_view", "object": "document:roadmap" }
    },
    {
      "correlation_id": "anne-edit-roadmap",
      "tuple_key": { "user": "user:anne", "relation": "can_edit", "object": "document:roadmap" }
    }
  ]
}
```

**ListUsers (`object` is an object, not a string; exactly one user filter):**

```json
{
  "authorization_model_id": "01G50QVV17PECNVAHX1GG4Y5NC",
  "object": { "type": "document", "id": "roadmap" },
  "relation": "can_view",
  "user_filters": [{ "type": "user" }]
}
```

### Common Mistakes

**Incorrect (contextual tuples shape copied from Check into ListUsers):**

```json
{
  "object": { "type": "document", "id": "roadmap" },
  "relation": "can_view",
  "user_filters": [{ "type": "user" }],
  "contextual_tuples": {
    "tuple_keys": [{ "user": "user:anne", "relation": "member", "object": "group:eng" }]
  }
}
```

**Correct:**

Check, BatchCheck items, Expand, ListObjects, and StreamedListObjects wrap contextual tuples in `{"tuple_keys": [...]}`. ListUsers takes a plain array.

```json
{
  "object": { "type": "document", "id": "roadmap" },
  "relation": "can_view",
  "user_filters": [{ "type": "user" }],
  "contextual_tuples": [
    { "user": "user:anne", "relation": "member", "object": "group:eng" }
  ]
}
```

**Other rules:**

- Always send `authorization_model_id` on Check, BatchCheck, ListObjects, ListUsers, Expand, and Write. It avoids a lookup of the latest model and keeps behavior stable until you deliberately roll out a new model (see `getting-started/tuples-api-best-practices` in `docs-llms-txt`).
- `consistency` is `MINIMIZE_LATENCY` (the default) or `HIGHER_CONSISTENCY`. `HIGHER_CONSISTENCY` skips the cache and adds latency; use it only when a query must reflect a write made moments earlier, not on every request.
- Write is transactional and, by default, not idempotent: writing an existing tuple or deleting a missing one fails the whole request. Set `on_duplicate: "ignore"` / `on_missing: "ignore"` when retries or replays are expected.
- Read is paginated (`page_size` 1-100): loop until `continuation_token` is empty. ReadChanges returns the same `continuation_token` when there are no newer changes; persist it and poll with it later instead of looping until empty.
- ListObjects returns at most `OPENFGA_LIST_OBJECTS_MAX_RESULTS` results (default 1000) within `OPENFGA_LIST_OBJECTS_DEADLINE` (default 3s), unordered. Use StreamedListObjects when you need every result.
- WriteAuthorizationModel returns `201` with `authorization_model_id`. Models are immutable; store and deploy that ID instead of relying on "latest".

### Error Responses

| Status | Meaning | What to do |
|--------|---------|------------|
| 400 | Invalid input. Body is `{"code": "<ErrorCode>", "message": "..."}`, e.g. `validation_error`, `invalid_tuple`, `write_failed_due_to_invalid_input` (duplicate write or missing delete), `authorization_model_not_found`, `latest_authorization_model_not_found` (store has no model, or wrong `store_id`) | Fix the request; do not retry unchanged |
| 401 / 403 | Not authenticated / forbidden | Check the API token or client credentials |
| 404 | Unknown path (`undefined_endpoint`) or store (`store_id_not_found`) | Check the API URL and `store_id` |
| 409 | Transaction conflict | Retry with backoff |
| 422 | Request throttled and timed out | Retry with backoff; reduce concurrency |
| 500 | Internal error | Retry with backoff; report if persistent |

To validate payloads and look up exact field names, limits, and error codes, use the OpenAPI spec (see `docs-openapi-validation`).
