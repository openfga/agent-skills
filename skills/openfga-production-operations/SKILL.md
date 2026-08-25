---
name: openfga-production-operations
description: Production deployment and operations guidance for OpenFGA product users, especially platform engineers, operators, and SREs. Use when planning capacity, choosing a datastore, running schema migrations, configuring Docker, Compose, Kubernetes, or Helm, securing endpoints and secrets, tuning caches and limits, adding telemetry and health checks, upgrading or rolling back, validating a deployment, or collecting incident evidence. Not for contributing to the OpenFGA server or changing Go internals.
license: Apache-2.0
metadata:
  author: openfga
  version: "1.0.0"
---

# OpenFGA Production Operations

## Audience

This is a **product-user skill** for platform engineers, operators, and SREs who deploy and run OpenFGA. It complements the `openfga` modeling skill. It does not provide contributor guidance for developing the `openfga/openfga` server or modifying its Go internals.

## Operating Boundaries

- Use supported public configuration, official images, and the official Helm chart.
- Treat the datastore as the persistence and backup boundary.
- Keep authorization-model design in the `openfga` skill; this skill covers the service that hosts those models and tuples.
- Prefer release-tagged source files for the deployed version. Do not copy defaults from `main` into production without checking the matching release.
- Do not promise numeric capacity, availability, rollback safety, or Kubernetes behavior that official sources do not guarantee.

## Non-Negotiable Production Rules

1. Never use the in-memory datastore for production.
2. Disable the Playground in production. It is a local-development feature.
3. Pin OpenFGA and chart versions; do not deploy a floating `latest` image.
4. Run the matching `openfga migrate` operation before starting or rolling out that server version.
5. Protect public endpoints with a supported authentication mode and TLS. Do not expose admin, metrics, profiler, health, or Playground ports by accident.
6. Keep datastore credentials, preshared keys, OIDC material, and TLS private keys in a secret manager or orchestrator Secret, not in source-controlled values.
7. Do not treat OpenFGA's experimental built-in access control as production-ready.
8. Validate with the config schema and actual CLI help for the deployed release; generated configuration docs can lag or derive flag names incorrectly.
9. Do not assume a database migration can be rolled back safely. Verify compatibility in the release notes before changing versions.
10. Redact secrets and sensitive relationship data before sharing incident evidence.

## Production Lifecycle

1. **Define the operating envelope.** Record traffic shape, latency and availability objectives, model/query complexity, tuple volume and growth, consistency needs, failure domains, datastore topology, and recovery objectives. Read [architecture and capacity](references/architecture-and-capacity.md).
2. **Choose the persistence design.** Select a supported datastore, size its pools, define migration ownership and ordering, and document datastore-native backup and restore. Read [datastore lifecycle](references/datastore-lifecycle.md).
3. **Design the trust boundary.** Choose `preshared` or `oidc` where traffic crosses a trust boundary, place TLS correctly, restrict listeners and CORS, and source secrets safely. Read [security and networking](references/security-and-networking.md).
4. **Set observability before load.** Configure structured logs, metrics, traces, and datastore-aware health checks; define evidence and redaction procedures. Read [observability and incidents](references/observability-and-incidents.md).
5. **Tune from measurements.** Load test representative Check, BatchCheck, ListObjects, and ListUsers paths before changing concurrency, depth, deadline, cache, throttle, or pool controls. Read [performance and limits](references/performance-and-limits.md).
6. **Build a repeatable deployment.** Pin artifacts, separate migrations from serving, configure resources and graceful termination, and render deployment manifests before applying them. Read [deployment patterns](references/deployment-patterns.md).
7. **Validate and smoke test.** Check release-specific config names, render packaging, verify health, then execute a minimal authenticated API workflow. Read [validation and smoke tests](references/validation-and-smoke-tests.md).
8. **Upgrade deliberately.** Back up the datastore, read every intervening release note, run the target migration once, roll out incrementally, and retain evidence needed to decide whether rollback is compatible.

## Reference Index

| Reference | Use it for |
|---|---|
| [Architecture and capacity](references/architecture-and-capacity.md) | Topology, HA questions, horizontal scaling, resources, graceful shutdown |
| [Datastore lifecycle](references/datastore-lifecycle.md) | Support boundaries, migrations, pools, health, backup/restore, upgrades |
| [Security and networking](references/security-and-networking.md) | Authentication, secrets, TLS, proxying, listeners, exposure |
| [Observability and incidents](references/observability-and-incidents.md) | Logs, metrics, traces, health, incident evidence and redaction |
| [Performance and limits](references/performance-and-limits.md) | Caching, throttling, query/depth/deadline limits, tuning order |
| [Deployment patterns](references/deployment-patterns.md) | Docker, Compose, Kubernetes, Helm, resource and rollout safety |
| [Validation and smoke tests](references/validation-and-smoke-tests.md) | Config checks, manifest checks, health and API smoke tests |
| [Upstream source map](references/upstream-source-map.md) | Release-specific public config and generated/source-of-truth distinctions |

## Expected Operator Output

When applying this skill, produce:

- an explicit datastore and migration plan;
- a version-pinned configuration with secrets referenced, not embedded;
- a network and authentication exposure map;
- resource, health, telemetry, and graceful-shutdown settings;
- tested backup/restore and upgrade/rollback decision procedures;
- render/validation results and post-deploy smoke-test evidence;
- an incident bundle checklist with a redaction step.
