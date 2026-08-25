---
title: Operations and Performance Decision Trees
---

# Operations and Performance Decision Trees

## Server startup or datastore migration failure

1. Capture the image/binary version, startup command shape, config key names, first fatal error, and datastore engine. Redact every secret value.
2. Check `/healthz`. If the process exits before serving, use startup logs rather than retrying application traffic.
3. Confirm configuration precedence: explicit flags override `OPENFGA_*` variables, which override the selected config file.
4. Confirm the datastore:
   - `memory` is ephemeral and loses stores/models/tuples on restart.
   - PostgreSQL, MySQL, and SQLite require the appropriate URI and migrations.
5. Run migrations as a deliberate deployment step for a new install or upgrade:

   ```bash
   openfga migrate \
     --datastore-engine postgres \
     --datastore-uri '<redacted-datastore-uri>'
   ```

   Never place a real datastore URI in a transcript. Verify migration compatibility and backup/rollback policy before running it against production.
6. Compare the deployed server version's `openfga run --help` and configuration schema with the manifest. Flags and experimental features are version-sensitive.
7. Validate datastore pool relationships and aggregate connection budgets across all OpenFGA instances and database clients. OpenFGA requires `MinOpenConns >= MinIdleConns`; a higher minimum-idle value fails startup validation.
8. If a migration fails, stop repeated retries, preserve the target schema version and sanitized error, and escalate before manual schema changes.

## Slow query, timeout, or throttling

1. Isolate operation and scope: Check, ListObjects, ListUsers, Read, Write, or BatchCheck; one relation; one synthetic graph shape.
2. Capture p50/p95/p99 latency, error rate, RPS, request ID/trace ID, server and datastore CPU/memory, DB query count/latency, active/idle connections, cache hit ratio, and goroutine count.
3. Capture a trace for a representative slow request. It is more useful than broad debug logs.
4. Classify the failure:
   - `deadline_exceeded`: compare client, HTTP upstream, server request, and list-operation deadlines.
   - `resource_exhausted`: inspect concurrency, connection, entity, or request-size limits.
   - `authorization_model_resolution_too_complex`: inspect graph depth/breadth and use `skills/openfga` to simplify the model before raising limits.
   - `throttled_timeout_error`: inspect dispatch/datastore throttling and the query's fan-out.
   - `unavailable`: check health, datastore availability, network, and deployment events.
5. Compare explicit `MINIMIZE_LATENCY` and `HIGHER_CONSISTENCY` behavior, but do not use consistency as a generic performance fix.
6. Change one documented limit or resource at a time, load test with synthetic data, and record before/after evidence. Prefer model/query corrections over unbounded limits.

## Pagination and result limits

These are different failure modes:

- Tuple reads, model lists, and change feeds can paginate. Preserve continuation tokens with the same filters; a change-feed token is type-scoped.
- CLI `--max-pages` may stop before all pages. `0` means all pages only where the command documents that behavior.
- ListObjects and ListUsers compute bounded result sets. They are controlled by server deadlines and maximum-result settings rather than client continuation tokens.
- Tuple write/import batching has per-request and client parallelism/rate controls; a partial client-side run is not proof that all writes committed.

When a result appears incomplete:

1. Record page size, max pages, continuation token presence, filters, server list deadline, and maximum results.
2. Repeat one missing object/user with Check.
3. Do not raise list maximums until you have measured query cost and confirmed the client truly needs the larger result.

## Logs and telemetry

- Capture `X-Request-Id` from HTTP responses. When tracing is enabled it can correlate with the trace ID.
- Search structured logs by request ID/trace ID and record service, method, encoded OpenFGA error code, duration, and user agent.
- Prefer production JSON logs at `info`; do not disable logging to hide sensitive output. Configure redaction and access controls instead.
- Capture Prometheus and OTLP endpoint names/configuration, sampling ratio, and relevant metrics, but never include credentials or private telemetry payloads.
- Treat exact flags/defaults as version-specific. Verify them against the deployed release.

## Official sources

- [OpenFGA configuration](https://openfga.dev/docs/getting-started/setup-openfga/configuration)
- [Configure OpenFGA](https://openfga.dev/docs/getting-started/setup-openfga/configure-openfga)
- [Running OpenFGA in production](https://openfga.dev/docs/best-practices/running-in-production)
- [Report OpenFGA runtime issues](https://openfga.dev/docs/getting-started/setup-openfga/reporting-runtime-issues)
- [Consistency](https://openfga.dev/docs/interacting/consistency)
- [Pinned implementation pointers](official-sources.md)
