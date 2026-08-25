# Architecture and Capacity

## Start With Questions, Not Replica Counts

Capture:

- availability and latency objectives by API path;
- expected and peak request rates for Check, BatchCheck, ListObjects, and ListUsers;
- authorization-model depth, breadth, conditions, and representative worst-case queries;
- tuple count, write rate, growth, and consistency requirements;
- datastore engine, version, region, failover model, read-replica plan, and connection budget;
- failure domains, rollout constraints, recovery time, and recovery point objectives;
- telemetry sampling and retention costs.

Official production guidance is qualitative. It recommends small pools of high-capacity OpenFGA servers, co-location with the datastore where practical, and measurement-driven tuning. It does not publish a universal QPS-per-replica, HA, or SLO guarantee.

## Service Topology

- OpenFGA serving replicas share state through the configured datastore. Scale serving replicas horizontally only after confirming the datastore and its connection budget can absorb the additional concurrency.
- Keep migrations outside the serving replica startup race. Use one controlled migration job or init phase for a version, then permit serving replicas to start.
- Spread replicas across the failure domains that exist in the target platform, but do not describe chart knobs such as affinity or topology spread as an OpenFGA availability guarantee.
- For PostgreSQL read replicas, use only the documented secondary datastore configuration. Requests requiring `HIGHER_CONSISTENCY` are routed to the primary according to the official datastore guidance.
- Do not use `memory` to simulate production HA. Every process has ephemeral local state and the server documentation marks it as development-only.

## Capacity Test

1. Build a sanitized dataset with production-like tuple cardinality and model complexity.
2. Measure each API path independently and in the expected traffic mix.
3. Record server CPU, memory, request latency/error rate, datastore latency, open/idle connections, cache behavior, and throttle activity.
4. Increase one limit or resource at a time.
5. Re-run failure tests: datastore latency, replica termination, rollout, and dependency recovery.
6. Preserve the tested configuration and dataset description with the release version.

Do not infer capacity from a simple `/healthz` response or a single Check request.

## Resources and Termination

- Set CPU and memory requests from observed steady-state use, then add headroom for burst and model complexity.
- Set limits only after load testing; CPU throttling and memory termination can distort latency and availability.
- Configure the public `OPENFGA_SHUTDOWN_TIMEOUT` for graceful server shutdown.
- Make the orchestrator's termination grace period longer than the server shutdown timeout and account for pre-stop behavior. Verify this relationship in a termination test.
- OpenFGA attempts graceful gRPC shutdown and falls back to a hard stop when its timeout expires. Do not claim that all in-flight work completes.
- Treat lifecycle hooks and raw resource blocks exposed by Helm as Kubernetes pass-through fields. Validate their semantics against the target Kubernetes version.

## Official Sources

- [Running OpenFGA in production](https://openfga.dev/docs/best-practices/running-in-production)
- [Current server configuration schema](https://github.com/openfga/openfga/blob/main/.config-schema.json)
- [Server graceful shutdown implementation](https://github.com/openfga/openfga/blob/main/cmd/run/cleanups.go)
- [Official chart values](https://github.com/openfga/helm-charts/blob/main/charts/openfga/values.yaml)
- [Official chart deployment template](https://github.com/openfga/helm-charts/blob/main/charts/openfga/templates/deployment.yaml)

Use the matching release tag rather than `main` when making a production change.
