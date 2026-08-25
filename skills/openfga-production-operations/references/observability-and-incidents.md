# Observability and Incidents

## Baseline Telemetry

Configure telemetry before performance or availability testing.

### Logs

Use structured production logs and a stable collection path:

```text
OPENFGA_LOG_FORMAT
OPENFGA_LOG_LEVEL
OPENFGA_LOG_TIMESTAMP_FORMAT
```

Official production guidance recommends JSON at info level as a starting point. Treat log level as an operational choice and avoid debug logging during normal production traffic.

### Metrics

```text
OPENFGA_METRICS_ENABLED
OPENFGA_METRICS_ADDR
OPENFGA_METRICS_ENABLE_RPC_HISTOGRAMS
OPENFGA_DATASTORE_METRICS_ENABLED
```

Restrict the metrics listener to collectors. RPC histograms increase metric volume; establish a cardinality and retention budget before enabling them.

At minimum, alert or dashboard:

- request rate, error rate, and latency by API method;
- datastore latency, errors, connection use, and health;
- dispatch and datastore throttle activity;
- cache activity relevant to enabled caches;
- CPU, memory, restarts, and termination;
- migration job success and duration.

Use names exported by the deployed version rather than freezing metric names in this skill.

### Traces

```text
OPENFGA_TRACE_ENABLED
OPENFGA_TRACE_OTLP_ENDPOINT
OPENFGA_TRACE_OTLP_TLS_ENABLED
OPENFGA_TRACE_SAMPLER
OPENFGA_TRACE_SAMPLE_RATIO
OPENFGA_TRACE_SERVICE_NAME
OTEL_RESOURCE_ATTRIBUTES
```

Choose sampling from evidence volume, cost, and incident needs. Protect the OTLP path and confirm whether trace attributes can contain identifiers that require data-handling controls.

## Health

OpenFGA publishes:

- HTTP `GET /healthz`;
- gRPC `grpc.health.v1.Health/Check`.

These checks test datastore health. The gRPC health service explicitly bypasses OpenFGA authentication middleware, so treat health endpoints as unauthenticated and restrict them at the network layer. Use the appropriate protocol for load-balancer and orchestrator checks. Do not invent a separate readiness contract or treat health as a substitute for an authenticated authorization smoke test.

The official container includes `grpc_health_probe`, and the Helm chart includes a plaintext `helm test` connection check. That chart test is not TLS-aware; when gRPC TLS is enabled, use a separately managed test with the required TLS and certificate options. Inspect release-specific artifacts before relying on exact paths or ports.

## Incident Evidence

Prefer a minimal sanitized reproduction:

1. OpenFGA version, image digest, chart version, and deployment platform.
2. Sanitized authorization model and minimum relationship tuples needed to reproduce.
3. Reproduction commands or script, including API method and consistency option.
4. Configuration with secrets omitted, plus explicit notes for non-default limits.
5. Infrastructure shape: replica count, resources, datastore engine/version/topology, proxy, and network path.
6. Metrics and traces covering the failure window.
7. Logs from startup through failure, with timestamps and correlation identifiers.
8. Recent changes: server/chart upgrade, migration, model change, datastore event, or tuning change.

If a minimal reproduction is not possible, include the broader evidence requested by the official runtime-issue guide.

## Redaction Gate

Before sharing:

- remove preshared keys, bearer tokens, OIDC tokens, cookies, TLS private keys, DSNs, credentials, and secret names that reveal sensitive structure;
- replace store, object, user, tenant, and relation identifiers with consistent synthetic values;
- sanitize relationship tuples and condition context, which may contain customer or personal data;
- inspect logs, traces, screenshots, terminal output, environment dumps, and rendered manifests;
- prefer synthetic or anonymized data and use the confidential contact path documented by the project when public disclosure is unsafe.

Do not use broad redaction that destroys the relationship among identifiers needed to reproduce the issue. Replace values consistently.

## Official Sources

- [Configure health, metrics, traces, and logs](https://openfga.dev/docs/getting-started/setup-openfga/configure-openfga)
- [Running OpenFGA in production](https://openfga.dev/docs/best-practices/running-in-production)
- [Reporting runtime issues](https://openfga.dev/docs/getting-started/setup-openfga/reporting-runtime-issues)
- [Server telemetry Compose overlay](https://github.com/openfga/openfga/blob/main/docker-compose.override.yaml)
- [Server configuration schema](https://github.com/openfga/openfga/blob/main/.config-schema.json)
- [Health service authentication override](https://github.com/openfga/openfga/blob/main/pkg/server/health/health.go)
- [Container health check](https://github.com/openfga/openfga/blob/main/Dockerfile)
- [Helm connection test](https://github.com/openfga/helm-charts/blob/main/charts/openfga/templates/tests/test-connection.yaml)
