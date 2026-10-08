---
title: Validate API Payloads Against the OpenAPI Spec
---

## Validate API Payloads Against the OpenAPI Spec

The OpenFGA HTTP API is defined by an OpenAPI 3.0 spec maintained in the [openfga/api](https://github.com/openfga/api) repository. Treat it as the source of truth for endpoint paths, field names, required fields, enums, and length limits.

- Spec (browse): `https://github.com/openfga/api/blob/main/docs/openapiv3/apidocs.openapi.json`
- Spec (raw JSON): `https://raw.githubusercontent.com/openfga/api/main/docs/openapiv3/apidocs.openapi.json`

Use it when you write raw HTTP requests, build a client or proxy, review SDK-generated payloads, or debug a `400` response. Do not invent field names from memory: SDKs rename fields (`authorizationModelId`, `AuthorizationModelId`), but the spec and docs use `snake_case`. Validate before sending, because the server silently ignores unknown fields: a misspelled optional field such as `model_id` returns `200` and quietly falls back to the latest model.

**Incorrect (payload written from memory, never checked):**

```json
{
  "model_id": "01G50QVV17PECNVAHX1GG4Y5NC",
  "object": "document:roadmap",
  "relation": "can_view",
  "user_filters": [{ "type": "user" }, { "type": "group", "relation": "member" }]
}
```

Three problems: `object` must be `{type, id}`, ListUsers accepts exactly one user filter, and `model_id` is not a field. The server rejects the first two with a `400`, but silently ignores `model_id` and evaluates against the latest model. The schema alone does not flag the misspelled field; the script below checks for it.

**Correct (validated against `ListUsersBody`):**

```json
{
  "authorization_model_id": "01G50QVV17PECNVAHX1GG4Y5NC",
  "object": { "type": "document", "id": "roadmap" },
  "relation": "can_view",
  "user_filters": [{ "type": "user" }]
}
```

### Look Up Operations and Schemas with jq

```bash
SPEC_URL=https://raw.githubusercontent.com/openfga/api/main/docs/openapiv3/apidocs.openapi.json
curl -sSL "$SPEC_URL" -o /tmp/openfga-openapi.json

# Every operation: METHOD path operationId
jq -r '.paths | to_entries[] | .key as $p | .value | to_entries[]
  | "\(.key | ascii_upcase) \($p) \(.value.operationId)"' /tmp/openfga-openapi.json

# Request body schema name for an operation
jq -r '.paths["/stores/{store_id}/list-users"].post.requestBody.content["application/json"].schema["$ref"]' /tmp/openfga-openapi.json
# #/components/schemas/ListUsersBody

# Fields, required list, and limits for a schema
jq '.components.schemas.ListUsersBody | {required, properties: (.properties | map_values(del(.description)))}' /tmp/openfga-openapi.json

# All input error codes a 400 response can return
jq -r '.components.schemas.ErrorCode.enum[]' /tmp/openfga-openapi.json
```

### Validate a Payload

Request bodies map to these schemas:

| Operation | Schema |
|-----------|--------|
| CreateStore | `CreateStoreRequest` |
| WriteAuthorizationModel | `WriteAuthorizationModelBody` |
| Write | `WriteBody` |
| Read | `ReadBody` |
| Check | `CheckBody` |
| BatchCheck | `BatchCheckBody` |
| ListObjects | `ListObjectsBody` |
| StreamedListObjects | `StreamedListObjectsBody` |
| ListUsers | `ListUsersBody` |
| Expand | `ExpandBody` |
| WriteAssertions | `WriteAssertionsBody` |

Save this as `validate_openfga.py` and run it with Python and `jsonschema` (`pip install jsonschema`):

```python
import json
import sys

from jsonschema import Draft7Validator

spec = json.load(open(sys.argv[1]))
schema_name = sys.argv[2]
payload = json.load(open(sys.argv[3]))

schemas = spec["components"]["schemas"]
validator = Draft7Validator({"$ref": f"#/components/schemas/{schema_name}", "components": spec["components"]})

problems = [f"{'/'.join(map(str, e.absolute_path)) or '<root>'}: {e.message}" for e in validator.iter_errors(payload)]

# The spec does not set additionalProperties: false, so flag unknown top-level fields explicitly.
known = set(schemas[schema_name].get("properties", {}))
problems += [f"{field}: unknown field for {schema_name}" for field in sorted(set(payload) - known)]

for problem in problems:
    print(problem)
print("valid" if not problems else f"{len(problems)} problem(s)")
sys.exit(1 if problems else 0)
```

```bash
$ python validate_openfga.py /tmp/openfga-openapi.json ListUsersBody payload.json
object: 'document:roadmap' is not of type 'object'
user_filters: [{'type': 'user'}, {'type': 'group', 'relation': 'member'}] is too long
model_id: unknown field for ListUsersBody
3 problem(s)
```

Fix every reported problem and re-run until it prints `valid`. Schema validation checks shape, not meaning: a valid payload can still fail at runtime if a type or relation is missing from the model. Use `fga model test` for model behavior (see `workflow-validate`).

### Constraints to Check

From the spec:

| Field | Constraint |
|-------|------------|
| Tuple `user` | String, max 512 characters: `type:id`, `type:id#relation`, or `type:*` |
| Tuple `relation` | String, max 50 characters |
| Tuple `object` | String, max 256 characters: `type:id` |
| `condition.name` | Max 256 characters; `condition.context` is a JSON object of the condition's parameters |
| `contextual_tuples` | Max 100 tuples. `{"tuple_keys": [...]}` everywhere except ListUsers, which takes a plain array |
| `consistency` | `MINIMIZE_LATENCY` (default) or `HIGHER_CONSISTENCY` |
| Write `on_duplicate` / `on_missing` | `error` (default) or `ignore` |
| Read `page_size` | 1 to 100 |
| ListUsers `object` | Object `{"type": "...", "id": "..."}`, not a string |
| ListUsers `user_filters` | Exactly 1 item: `{"type": "user"}` or `{"type": "group", "relation": "member"}` |
| BatchCheck `correlation_id` | Required and unique per item; must match `^[\w\d-]{1,36}$`. This rule is only in the description, so the validator above does not enforce it |

Server-side limits are configuration, not part of the spec. Defaults (confirm in `getting-started/setup-openfga/configuration`, see `docs-llms-txt`):

| Setting | Default |
|---------|---------|
| `OPENFGA_MAX_TUPLES_PER_WRITE` (writes + deletes in one Write) | 100 |
| `OPENFGA_MAX_CHECKS_PER_BATCH_CHECK` | 50 |
| `OPENFGA_LIST_OBJECTS_MAX_RESULTS` / `OPENFGA_LIST_USERS_MAX_RESULTS` | 1000 |
| `OPENFGA_LIST_OBJECTS_DEADLINE` / `OPENFGA_LIST_USERS_DEADLINE` | 3s |
| `OPENFGA_MAX_TYPES_PER_AUTHORIZATION_MODEL` | 100 |

SDKs split large BatchCheck calls and, in non-transaction mode, large writes into chunks for you. Raw HTTP clients must chunk themselves.
