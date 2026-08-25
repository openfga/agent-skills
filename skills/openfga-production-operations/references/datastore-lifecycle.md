# Datastore Lifecycle

## Support Boundaries

Check the deployed release's README and configuration schema before selecting an engine. Current official guidance identifies:

| Engine | Operational position |
|---|---|
| PostgreSQL | Production-supported; current server guidance requires PostgreSQL 14 or newer |
| MySQL | Production-supported; current server guidance requires MySQL 8 |
| SQLite | Beta; evaluate its documented limitations before use |
| Memory | Development and evaluation only; never production |

PostgreSQL has documented secondary/read-replica configuration. Do not assume another engine supports it. For MySQL, preserve the documented `parseTime=true` URI option and review tuple-field limits.

## Migration Ownership and Ordering

1. Pin the target OpenFGA version.
2. Back up the datastore using its native tooling and prove the restore procedure.
3. Read all intervening OpenFGA release notes.
4. Run the target image's `openfga migrate` command once against the target datastore.
5. Wait for successful completion before starting or rolling serving replicas.
6. Run datastore health and API smoke tests after rollout.

The official Compose artifact demonstrates `datastore -> migrate -> openfga` ordering. In the Helm chart, `migrationType: job` creates one migration Job and can make serving Pods wait for it. `migrationType: initContainer` instead renders a migration init container into every serving Pod. Prefer the Job strategy for multi-replica production. Use init-container mode only when the rollout explicitly serializes Pod creation so migration processes cannot race.

`openfga migrate --version` can select a migration target. Its existence is not a general downgrade guarantee. Do not move schema backward or roll the server back across a migration unless the relevant release documentation explicitly confirms compatibility.

## Public Datastore Configuration

Use the release-tagged `.config-schema.json` for exact names. The current schema includes:

```text
OPENFGA_DATASTORE_ENGINE
OPENFGA_DATASTORE_URI
OPENFGA_DATASTORE_USERNAME
OPENFGA_DATASTORE_PASSWORD
OPENFGA_DATASTORE_SECONDARY_URI
OPENFGA_DATASTORE_SECONDARY_USERNAME
OPENFGA_DATASTORE_SECONDARY_PASSWORD
OPENFGA_DATASTORE_MAX_CACHE_SIZE
OPENFGA_DATASTORE_MAX_TYPESYSTEM_CACHE_SIZE
OPENFGA_DATASTORE_MAX_OPEN_CONNS
OPENFGA_DATASTORE_MIN_OPEN_CONNS
OPENFGA_DATASTORE_MAX_IDLE_CONNS
OPENFGA_DATASTORE_MIN_IDLE_CONNS
OPENFGA_DATASTORE_CONN_MAX_IDLE_TIME
OPENFGA_DATASTORE_CONN_MAX_LIFETIME
OPENFGA_DATASTORE_METRICS_ENABLED
```

Keep URIs, usernames, and passwords in secrets. A URI can itself contain credentials, so redact the complete value from logs and incident bundles.

## Pool and Health Tuning

- Derive the total possible connection demand from replicas multiplied by per-replica pool settings, plus migrations, maintenance, and other clients.
- Keep the database's connection limit and failover behavior in the calculation.
- OpenFGA validates pool relationships, including maximum versus minimum open connections and minimum open versus minimum idle connections. Treat startup failure as a configuration error; do not bypass it.
- Observe connection acquisition latency, saturation, idle churn, connection lifetime, database latency, and errors before changing pool controls.
- `/healthz` and gRPC health exercise datastore health. Use them as dependency-aware health signals, not as proof that representative authorization queries meet latency objectives.

## Backup and Restore Boundary

OpenFGA does not provide a separate application-level backup format in the official operational material. Back up and restore the configured datastore with datastore-native mechanisms.

The runbook must state:

- what databases/schemas and credentials are included;
- backup frequency, retention, encryption, and ownership;
- point-in-time recovery capability;
- version and migration state captured with each backup;
- isolated restore-test cadence;
- post-restore migration and smoke-test steps.

Never claim a backup is usable until an isolated restore and OpenFGA smoke test succeed.

## Upgrade and Rollback Decision

Before rollout, record:

- current and target server/image versions;
- current and target chart versions, if applicable;
- migration state before and after;
- release-note compatibility statements;
- backup identifier and restore test;
- a rollback decision point.

If a target migration is not documented as backward-compatible, rollback may require restoring the datastore backup rather than only changing the image. Helm hook names such as `post-rollback` do not guarantee schema downgrade compatibility.

## Official Sources

- [Configure the OpenFGA datastore](https://openfga.dev/docs/getting-started/setup-openfga/configure-openfga)
- [OpenFGA release notes](https://github.com/openfga/openfga/releases)
- [Server configuration schema](https://github.com/openfga/openfga/blob/main/.config-schema.json)
- [Migration command source](https://github.com/openfga/openfga/blob/main/cmd/migrate/migrate.go)
- [Official Compose startup ordering](https://github.com/openfga/openfga/blob/main/docker-compose.yaml)
- [Helm migration Job](https://github.com/openfga/helm-charts/blob/main/charts/openfga/templates/job.yaml)
