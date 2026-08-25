# Runnable OpenFGA Examples

Use these examples as a small, internally consistent baseline. Recheck the current OpenFGA CLI and OpenAPI sources before publishing commands or payloads because interfaces can evolve.

## Authorization model

Save as `docs.fga`:

```fga
model
  schema 1.1

type user

type organization
  relations
    define member: [user]

type document
  relations
    define organization: [organization]
    define editor: [user]
    define viewer: [user] or editor or member from organization
```

Validate the DSL:

```bash
fga model validate --file docs.fga
```

This model lets a direct `viewer`, a direct `editor`, or a member of the document's organization view the document.

## CLI flow

Assume the CLI points to the intended server through `FGA_API_URL` or `--api-url`.

```bash
# Create a store and write docs.fga as its first model.
fga store create --model docs.fga

# Copy the returned store ID before running the remaining commands.
export FGA_STORE_ID="<store-id>"

# Add Anne to the organization and attach the document to that organization.
fga tuple write user:anne member organization:acme
fga tuple write organization:acme organization document:roadmap

# The inherited organization membership makes this true.
fga query check user:anne viewer document:roadmap
```

Expected check result:

```json
{
  "allowed": true
}
```

CLI tuple arguments are `user relation object`. In API JSON, the same tuple is represented with named `user`, `relation`, and `object` fields.

## Write API

With `FGA_STORE_ID` set and a server that does not require authentication:

```bash
curl --fail-with-body --silent --show-error \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
    "writes": {
      "tuple_keys": [
        {
          "user": "user:anne",
          "relation": "member",
          "object": "organization:acme"
        }
      ]
    }
  }' \
  "${FGA_API_URL%/}/stores/${FGA_STORE_ID}/write"
```

Add the authentication header required by the deployment; do not publish a real key or token.

## Check API

```bash
curl --fail-with-body --silent --show-error \
  --request POST \
  --header 'Content-Type: application/json' \
  --data '{
    "tuple_key": {
      "user": "user:anne",
      "relation": "viewer",
      "object": "document:roadmap"
    }
  }' \
  "${FGA_API_URL%/}/stores/${FGA_STORE_ID}/check"
```

For production examples, include a verified `authorization_model_id` so the request does not silently follow the latest model version:

```json
{
  "authorization_model_id": "01H...",
  "tuple_key": {
    "user": "user:anne",
    "relation": "viewer",
    "object": "document:roadmap"
  }
}
```

Use the exact current field names and behavior from the OpenAPI document linked by `customFields.apiDocsBasePath` in `docusaurus.config.js`.

## Example review checklist

- The model declares `schema 1.1`.
- Every tuple's type and relation exists in the model.
- Userset tuples include `#relation` only when the model allows that userset type.
- CLI argument order is `user relation object`.
- API payloads contain valid JSON with double-quoted keys and strings.
- The explanation traces the expected result through direct or computed relations.
- Commands state required environment variables and authentication assumptions.
- Placeholder IDs are visibly placeholders; examples contain no secrets.
- Model validation and the demonstrated query have been run when tooling is available.
