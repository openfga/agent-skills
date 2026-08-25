# Store and Model Lifecycle

## Provisioning ownership

A store contains authorization models and relationship tuples. Create it in an explicit provisioning or deployment step, persist the returned `id`, and inject that ID into applications. Do not create a store on each startup or select a store by name: names are labels and are not guaranteed unique.

Use separate stores only for intentional data/model isolation. Do not use a new store as a routine model version.

```http
POST /stores
Content-Type: application/json

{"name":"checkout-production"}
```

Persist the response `id` as deployment configuration such as `FGA_STORE_ID`.

## Immutable model strategy

Writing an authorization model creates a new immutable `authorization_model_id`. Record it with the application release and configure every runtime client with that exact ID.

If a request omits the model ID, relevant APIs can use the latest model. Do not rely on this in production: it permits an unrelated model write to change live decisions and adds a latest-model lookup.

When inspecting model history, page through every `ReadAuthorizationModels` continuation token; models are returned in reverse chronological order. `ListStores` is paginated as well. Do not assume either administrative list fits in one response.

Roll out a model change as a versioned deployment:

1. Design and test the model with the sibling [`openfga`](../../openfga/SKILL.md) modeling skill.
2. Write the model and capture the returned ID.
3. Test or shadow the new ID against representative tuples and queries.
4. Migrate tuples and application relation names in a compatible order.
5. Deploy application configuration pinned to the new ID.
6. Shift traffic gradually and retain a rollback path to the prior application/model pair.

Treat store ID and model ID as a pair. Validate both during startup and expose only non-secret identifiers in diagnostic output.

## Client configuration

Use deployment configuration or a secret manager:

```text
FGA_API_URL=https://fga.example.internal
FGA_STORE_ID=01H...
FGA_MODEL_ID=01J...
FGA_API_TOKEN=<injected secret; never commit>
```

Initialize one reusable client per process or dependency-injection scope. Fail startup when required configuration is missing or malformed rather than falling back to another store, latest model, or unauthenticated access.

Authentication choices:

- No authentication is for isolated local development only.
- API token/shared-key deployments must use TLS and secret injection/rotation.
- Client credentials are supported by SDKs for a provider or authentication wrapper that implements the token exchange. OpenFGA core does not implement that exchange.
- Do not claim a native workload-identity flow unless the chosen OpenFGA provider documents it.

Use least-privilege network and credential boundaries. Separate provisioning credentials from runtime credentials when the deployment supports it.

## Source pointers

- [Stores API contract](https://github.com/openfga/api/blob/main/openfga/v1/openfga_service.proto)
- [Immutable authorization models](https://openfga.dev/docs/getting-started/immutable-models)
- [Configure an SDK client](https://openfga.dev/docs/getting-started/setup-sdk-client)
- [CLI configuration and commands](https://openfga.dev/docs/getting-started/cli)
