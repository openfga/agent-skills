# Validation and Smoke Tests

## Release-Specific Configuration Check

1. Record the exact OpenFGA version and image digest.
2. Open `.config-schema.json` at that release tag and verify every environment variable, type, deprecation, and default used by the deployment.
3. Use the target image's `openfga run --help` and `openfga migrate --help` for actual CLI flags.
4. Inspect `cmd/run/run.go` and `cmd/run/flags.go` at the same tag if automation depends on exact flag or environment binding behavior.
5. Do not derive CLI flags mechanically from environment-variable names.
6. Start the target image with the intended non-secret configuration in a disposable environment. OpenFGA performs configuration validation at startup; treat any failure as blocking.

There is no dedicated server-config validation subcommand in the current binary. `openfga run` loads the configuration and verifies it before serving. Use `openfga run --help` and `openfga migrate --help` from the pinned target image.

The generated configuration documentation is useful for discovery but may lag the server release or derive a flag name that differs from the CLI implementation.

## Packaging Validation

### Docker or Compose

- resolve the pinned image digest;
- run the target migration against a disposable datastore;
- inspect the effective environment without printing secret values;
- verify read-only filesystem behavior, including writable `/tmp`;
- start the service and check container health.

### Helm

Run the repository- and cluster-approved equivalents of:

```bash
helm lint openfga/openfga --version "$CHART_VERSION" -f values.yaml
helm template openfga openfga/openfga --version "$CHART_VERSION" -f values.yaml > rendered.yaml
kubectl apply --dry-run=server -f rendered.yaml
kubectl diff -f rendered.yaml
```

Review `rendered.yaml` with secrets protected. A server-side dry run or diff requires cluster access and may invoke admission controls; use the commands supported by the target environment.

Block rollout if validation finds:

- `memory` datastore or enabled Playground;
- unpinned images;
- plaintext credentials in ordinary values;
- missing or duplicated migration execution;
- unauthenticated public exposure;
- unexpected Service, Ingress, metrics, health, or profiler ports;
- invalid pool relationships;
- termination grace shorter than server shutdown behavior.

## Post-Deploy Smoke Sequence

Use a synthetic store and identifiers. Run through the same authenticated and TLS path applications use.

1. Verify HTTP `/healthz` or gRPC `grpc.health.v1.Health/Check`.
2. Create a temporary store.
3. Write a minimal authorization model.
4. Write a synthetic relationship tuple.
5. Check one allowed relationship and one denied relationship.
6. If used by the application, exercise ListObjects or ListUsers with a bounded synthetic dataset.
7. Confirm expected logs, metrics, and traces.
8. Delete the temporary store if environment policy permits.

Health alone is not sufficient: it primarily establishes server and datastore health, not auth, model writes, tuple writes, query semantics, proxy routing, or telemetry.

The current official CLI form is:

```bash
export FGA_STORE_ID="$(
  fga store create --name "OpenFGA deployment smoke" |
    jq -r '.store.id'
)"

fga model write --store-id="$FGA_STORE_ID" --file smoke.fga
fga tuple write --store-id="$FGA_STORE_ID" user:smoke-reader viewer document:smoke
fga query check --store-id="$FGA_STORE_ID" user:smoke-reader viewer document:smoke
fga query check --store-id="$FGA_STORE_ID" user:smoke-denied viewer document:smoke
```

Use a minimal `smoke.fga` model:

```fga
model
  schema 1.1

type user

type document
  relations
    define viewer: [user]
```

Require the first query to return allowed and the second to return denied. Configure the CLI to use the deployed API URL, authentication, and TLS trust through its supported configuration for the installed version. Confirm exact flags with `fga <command> --help`.

Do not place a preshared key or bearer token directly in a shared shell command or CI log. Use the CLI's supported configuration/environment mechanism for the installed version.

## Upgrade Validation

Before:

- prove a datastore restore;
- record current migration state and smoke results;
- validate the target config and manifests;
- read all intervening release notes.

After migration and rollout:

- repeat health and API smoke tests;
- compare latency, errors, pool use, throttles, and cache behavior;
- verify migration job completion and serving replica stability;
- preserve the evidence for the rollback decision.

If rollback compatibility is not documented, stop and use the datastore restore plan rather than assuming an older server can use the migrated schema.

## Official Sources

- [Configuration documentation](https://openfga.dev/docs/getting-started/setup-openfga/configuration)
- [Configure OpenFGA](https://openfga.dev/docs/getting-started/setup-openfga/configure-openfga)
- [Server configuration schema](https://github.com/openfga/openfga/blob/main/.config-schema.json)
- [Actual run flags](https://github.com/openfga/openfga/blob/main/cmd/run/run.go)
- [Environment bindings and aliases](https://github.com/openfga/openfga/blob/main/cmd/run/flags.go)
- [Migration command](https://github.com/openfga/openfga/blob/main/cmd/migrate/migrate.go)
- [OpenFGA CLI documentation](https://github.com/openfga/cli)
- [Official CLI workflow examples](https://openfga.dev/docs/getting-started/cli)
- [Helm test template](https://github.com/openfga/helm-charts/blob/main/charts/openfga/templates/tests/test-connection.yaml)
