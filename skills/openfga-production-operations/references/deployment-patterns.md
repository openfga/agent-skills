# Deployment Patterns

## Common Rules

- Pin the OpenFGA version or digest and, for Helm, the chart version.
- Use an external production datastore with tested backup and restore.
- Run migrations as a separate, ordered step before serving.
- Disable the Playground and do not use the memory datastore.
- Inject credentials and key material from secrets.
- Configure authentication, TLS or a trusted terminating proxy, telemetry, resources, health checks, and graceful shutdown.
- Render and inspect the final configuration, including generated Secrets, Services, Ingresses, Jobs, and pod specifications.

## Docker

Use the official image for the pinned release. Do not carry `openfga/openfga:latest` from examples into production.

For a read-only root filesystem, preserve a writable `/tmp` because the HTTP gateway may use an internal Unix-domain socket:

```text
--read-only
--tmpfs /tmp
```

Run `openfga migrate` from the same target image before starting `openfga run`. Pass secrets using the platform's secret mechanism rather than command-line literals.

The image health check uses `grpc_health_probe`. Verify its release-specific port and command from the pinned Dockerfile/image metadata.

## Compose

The official Compose file is a development-oriented example but demonstrates safe dependency ordering:

```text
postgres healthy -> migrate completed successfully -> openfga starts
```

For any production-like Compose use:

- pin images;
- replace example credentials;
- persist and back up the datastore volume;
- remove public port mappings that are not needed;
- disable the Playground;
- add resource and restart policy decisions;
- validate secret handling and TLS.

Do not describe Compose examples as an HA architecture.

## Kubernetes and Helm

Use the official `openfga/openfga` chart. The OpenFGA Kubernetes documentation points to this chart; the chart's `values.yaml` and rendered templates are the operational source of truth.

Before installing:

1. Pin chart and application versions.
2. Override the default memory datastore with a supported external production datastore.
3. Disable the chart's default-enabled Playground.
4. Review migration Job/init-container behavior and use exactly one migration strategy.
5. Use existing Secret references where supported; inspect rendered Secrets and release history.
6. Set and load test replica count, resources, HPA, affinity, tolerations, and topology spread.
7. Render Service and Ingress resources and expose only intended ports.
8. Set termination behavior so platform grace exceeds `OPENFGA_SHUTDOWN_TIMEOUT`.
9. Run `helm lint`, `helm template`, policy checks, and a server-side dry run or diff supported by the target cluster.
10. Run `helm test` and authenticated API smoke tests after rollout.

### Verified Chart Paths

Use the paths in the pinned chart version, not a remembered values file:

| Concern | Current chart values |
|---|---|
| Datastore | `datastore.engine`, `datastore.uri`, `datastore.username`, `datastore.password` |
| Existing datastore Secret | `datastore.existingSecret`, `datastore.secretKeys.uriKey`, `usernameKey`, `passwordKey` |
| URI-only Secret | `datastore.uriSecret`; the referenced Secret key must be `uri` |
| Migrations | `datastore.applyMigrations`, `datastore.waitForMigrations`, `datastore.migrationType`, `datastore.migrations.resources` |
| Replicas and HPA | `replicaCount`, `autoscaling.enabled`, `minReplicas`, `maxReplicas`, CPU/memory targets |
| Playground | `playground.enabled` |
| Network | `http.enabled`, `http.addr`, `grpc.addr`, `service.type`, `ingress.*` |
| Health | `livenessProbe.*`, `readinessProbe.*`, `startupProbe.*`, or the corresponding `custom*Probe` |
| Pod behavior | `resources`, `lifecycle`, `extraEnvVars`, `extraVolumes`, `extraVolumeMounts` |

- The chart's Job/init-container migration logic applies to PostgreSQL and MySQL. Do not infer the same path for memory or SQLite.
- `OPENFGA_SHUTDOWN_TIMEOUT` has no first-class chart value; set it through `extraEnvVars`, then coordinate it with Kubernetes termination grace.
- Default probes use gRPC health. With gRPC TLS enabled, the chart switches to an exec probe using `grpc_health_probe`; a `custom*Probe` fully replaces chart defaults.
- `service.port` is the default Ingress backend port, not the source for every Service port. Render the chart and compare the Ingress backend with ports derived from `http.addr`, `grpc.addr`, and any enabled auxiliary listener.
- App-level `http.tls.*` and `grpc.tls.*` values point OpenFGA at certificate files. The chart does not create the certificate volume; provide and review `extraVolumes` and `extraVolumeMounts`.

### Production Values Skeleton

This is intentionally incomplete: replace every placeholder and add tested resources, replica/HPA settings, probes, and TLS/Ingress policy for the target platform.

```yaml
datastore:
  engine: postgres
  existingSecret: openfga-datastore
  secretKeys:
    uriKey: uri
    usernameKey: username
    passwordKey: password
  applyMigrations: true
  waitForMigrations: true
  migrationType: job

playground:
  enabled: false

service:
  type: ClusterIP

extraEnvVars:
  - name: OPENFGA_AUTHN_METHOD
    value: oidc
  - name: OPENFGA_AUTHN_OIDC_ISSUER
    value: "replace-with-oidc-issuer-url"
  - name: OPENFGA_AUTHN_OIDC_AUDIENCE
    value: "replace-with-audience"
  - name: OPENFGA_SHUTDOWN_TIMEOUT
    value: "replace-with-tested-duration"
```

Do not deploy the placeholder values. If TLS terminates in the chart-managed pod, add the release-specific `http.tls.*` or `grpc.tls.*` settings and certificate volume mounts. If it terminates at an ingress or load balancer, document and restrict the backend network.

Important chart caveats:

- The chart's default datastore is `memory`, and the deployment template forces one replica for that engine.
- The chart enables the Playground by default even though production guidance says to disable it.
- Bundled Bitnami PostgreSQL and MySQL subcharts are deprecated. Follow current chart guidance for an external/managed database or a separately managed database deployment.
- Values such as `resources`, `lifecycle`, affinity, tolerations, and topology spread pass through to Kubernetes objects. They are not OpenFGA operational guarantees.
- Do not invent NetworkPolicy, PodDisruptionBudget, secret-rotation, or disruption guarantees when the chart does not document them.

## Render Review Checklist

Inspect the rendered output for:

- exact image and chart versions;
- datastore engine and secret references;
- one migration mechanism and correct startup ordering;
- auth mode and TLS/proxy assumptions;
- Playground and profiler disabled unless explicitly required;
- listener, Service, and Ingress ports;
- wildcard CORS;
- resources, HPA bounds, scheduling, and failure-domain spread;
- health checks and termination grace;
- telemetry listeners and network exposure;
- no plaintext secret values in ordinary configuration.

## Official Sources

- [Docker setup](https://openfga.dev/docs/getting-started/setup-openfga/docker)
- [Kubernetes setup](https://openfga.dev/docs/getting-started/setup-openfga/kubernetes)
- [Official Dockerfile](https://github.com/openfga/openfga/blob/main/Dockerfile)
- [Official Compose file](https://github.com/openfga/openfga/blob/main/docker-compose.yaml)
- [OpenFGA Helm chart](https://github.com/openfga/helm-charts/tree/main/charts/openfga)
- [Chart values](https://github.com/openfga/helm-charts/blob/main/charts/openfga/values.yaml)
- [Chart deployment template](https://github.com/openfga/helm-charts/blob/main/charts/openfga/templates/deployment.yaml)
- [Chart migration Job](https://github.com/openfga/helm-charts/blob/main/charts/openfga/templates/job.yaml)
- [PostgreSQL subchart migration guide](https://github.com/openfga/helm-charts/blob/main/charts/openfga/docs/migrate-postgres-from-bitnami.md)
- [MySQL subchart migration guide](https://github.com/openfga/helm-charts/blob/main/charts/openfga/docs/migrate-mysql-from-bitnami.md)
