# Upstream Source Map

Use this hierarchy whenever exact names or behavior matter.

## 1. Deployed Release Sources

Replace `<version>` with the deployed OpenFGA tag:

```text
https://github.com/openfga/openfga/blob/<version>/.config-schema.json
https://github.com/openfga/openfga/blob/<version>/cmd/run/run.go
https://github.com/openfga/openfga/blob/<version>/cmd/run/flags.go
https://github.com/openfga/openfga/blob/<version>/cmd/migrate/migrate.go
https://github.com/openfga/openfga/blob/<version>/pkg/server/config/config.go
https://github.com/openfga/openfga/blob/<version>/Dockerfile
https://github.com/openfga/openfga/blob/<version>/docker-compose.yaml
```

Use:

- `.config-schema.json` for public environment-variable names, types, deprecations, and defaults;
- `cmd/run/run.go` for actual CLI flags;
- `cmd/run/flags.go` for environment bindings and aliases;
- `cmd/migrate/migrate.go` for migration CLI behavior;
- `pkg/server/config/config.go` for startup validation;
- release notes for compatibility and migration instructions.

Do not use Go internals to design unsupported behavior. These files are source pointers for the public operational interface.

## 2. Published Product Documentation

| Topic | Official page |
|---|---|
| Setup overview | https://openfga.dev/docs/getting-started/setup-openfga/overview |
| Configure OpenFGA | https://openfga.dev/docs/getting-started/setup-openfga/configure-openfga |
| Configuration reference | https://openfga.dev/docs/getting-started/setup-openfga/configuration |
| Playground | https://openfga.dev/docs/getting-started/setup-openfga/playground |
| Access control | https://openfga.dev/docs/getting-started/setup-openfga/access-control |
| Docker | https://openfga.dev/docs/getting-started/setup-openfga/docker |
| Kubernetes | https://openfga.dev/docs/getting-started/setup-openfga/kubernetes |
| Production guidance | https://openfga.dev/docs/best-practices/running-in-production |
| Runtime issues | https://openfga.dev/docs/getting-started/setup-openfga/reporting-runtime-issues |

The configuration page is generated from a config schema snapshot by the `openfga.dev` repository. It is a discovery aid, not the final authority for a different deployed release. The generator can mechanically derive a displayed flag name that differs from the actual CLI flag. Confirm flags with `openfga run --help` or release-tagged `cmd/run/run.go`.

Generator and page sources:

```text
https://github.com/openfga/openfga.dev/blob/main/scripts/update-config-page.mjs
https://github.com/openfga/openfga.dev/blob/main/docs/content/getting-started/setup-openfga/configuration.mdx
```

## 3. Helm Release Sources

Pin a chart version, then inspect that chart release:

```text
https://github.com/openfga/helm-charts/blob/main/charts/openfga/Chart.yaml
https://github.com/openfga/helm-charts/blob/main/charts/openfga/values.yaml
https://github.com/openfga/helm-charts/blob/main/charts/openfga/templates/deployment.yaml
https://github.com/openfga/helm-charts/blob/main/charts/openfga/templates/job.yaml
https://github.com/openfga/helm-charts/blob/main/charts/openfga/templates/service.yaml
https://github.com/openfga/helm-charts/blob/main/charts/openfga/templates/ingress.yaml
https://github.com/openfga/helm-charts/blob/main/charts/openfga/templates/secrets.yaml
https://github.com/openfga/helm-charts/blob/main/charts/openfga/templates/tests/test-connection.yaml
```

`values.yaml` plus rendered templates are the source of truth for chart behavior. The README is guidance and can lag template details. Validate raw Kubernetes pass-through values against the target cluster.

## Known Review Traps

- A generated docs flag can differ from the real mixed-case CLI flag.
- Schema and environment binding names can occasionally diverge; use a release-specific startup test when they do.
- Chart helpers can emit a value not present in the current server schema; verify the rendered environment against the target server version.
- Chart README replica claims can differ from template behavior for `memory`.
- Chart defaults can enable the Playground even though production guidance says to disable it.
- A migration hook that runs on rollback does not guarantee that schema downgrade is safe.

When sources disagree, do not guess. Pin the relevant versions, inspect the rendered/effective configuration, and run a disposable startup or smoke test.
