# Performance and Limits

## Tune in Dependency Order

1. Reproduce the production model, tuple cardinality, consistency mode, and API mix.
2. Establish datastore latency, pool use, server CPU/memory, request latency, and errors.
3. Set client and proxy deadlines before changing server operation deadlines.
4. Bound expensive work with concurrency, depth/breadth, result, and condition-cost limits.
5. Tune datastore pools within the database connection budget.
6. Add dispatch or datastore throttling when measurements show overload risk.
7. Enable and size caches only after measuring hit behavior, memory cost, and write patterns.
8. Re-test normal load, overload, datastore degradation, and replica termination.

Change one control group at a time and preserve the before/after evidence.

## Query and Deadline Controls

Verify exact names in the deployed release's `.config-schema.json`. Current public controls include:

```text
OPENFGA_MAX_CONCURRENT_READS_FOR_CHECK
OPENFGA_MAX_CONCURRENT_READS_FOR_LIST_OBJECTS
OPENFGA_MAX_CONCURRENT_READS_FOR_LIST_USERS
OPENFGA_MAX_CONCURRENT_CHECKS_PER_BATCH_CHECK
OPENFGA_RESOLVE_NODE_LIMIT
OPENFGA_RESOLVE_NODE_BREADTH_LIMIT
OPENFGA_LIST_OBJECTS_DEADLINE
OPENFGA_LIST_OBJECTS_MAX_RESULTS
OPENFGA_LIST_USERS_DEADLINE
OPENFGA_LIST_USERS_MAX_RESULTS
OPENFGA_REQUEST_TIMEOUT
OPENFGA_SHUTDOWN_TIMEOUT
OPENFGA_LIST_OBJECTS_PIPELINE_ENABLED
OPENFGA_MAX_CONDITION_EVALUATION_COST
```

- Lower limits can reject or truncate work that callers expect; test application behavior.
- Higher limits can amplify datastore and memory pressure; do not increase them without overload tests.
- Coordinate client, ingress/proxy, HTTP upstream, request, ListObjects, and ListUsers deadlines so failures occur at an intentional layer.
- Do not copy numeric defaults from documentation. Some are intentionally broad and official production guidance says to tune them.

## Cache Controls

Current public cache groups include:

```text
OPENFGA_CHECK_CACHE_LIMIT
OPENFGA_CHECK_ITERATOR_CACHE_ENABLED
OPENFGA_CHECK_ITERATOR_CACHE_MAX_RESULTS
OPENFGA_CHECK_ITERATOR_CACHE_TTL
OPENFGA_CHECK_QUERY_CACHE_ENABLED
OPENFGA_CHECK_QUERY_CACHE_TTL
OPENFGA_LIST_OBJECTS_ITERATOR_CACHE_ENABLED
OPENFGA_LIST_OBJECTS_ITERATOR_CACHE_MAX_RESULTS
OPENFGA_LIST_OBJECTS_ITERATOR_CACHE_TTL
OPENFGA_CACHE_CONTROLLER_ENABLED
OPENFGA_CACHE_CONTROLLER_TTL
OPENFGA_CACHE_TTL_JITTER_PERCENTAGE
OPENFGA_SHARED_ITERATOR_ENABLED
OPENFGA_SHARED_ITERATOR_LIMIT
```

The schema marks some older cache fields as deprecated. Do not introduce a deprecated key into a new deployment. Confirm cache memory use under realistic cardinality and mutation rates.

## Throttling Controls

The current schema exposes separate groups for:

- `OPENFGA_CHECK_DISPATCH_THROTTLING_*`
- `OPENFGA_LIST_OBJECTS_DISPATCH_THROTTLING_*`
- `OPENFGA_LIST_USERS_DISPATCH_THROTTLING_*`
- `OPENFGA_CHECK_DATASTORE_THROTTLE_*`
- `OPENFGA_LIST_OBJECTS_DATASTORE_THROTTLE_*`
- `OPENFGA_LIST_USERS_DATASTORE_THROTTLE_*`

Read the release-tagged schema for the complete suffixes and defaults. Configure queues, thresholds, frequencies, and percentages as one tested policy rather than independent copy/paste values.

## Datastore Connections

Tune the pool controls documented in [datastore lifecycle](datastore-lifecycle.md) together with:

- number of OpenFGA replicas;
- migration and maintenance connections;
- primary and secondary database limits;
- failover behavior;
- request concurrency and throttle settings.

A larger pool does not fix a slow or saturated datastore. It can increase contention and failure impact.

## Evidence to Keep

For every tuning change, retain:

- release and configuration diff;
- workload description and sanitized model characteristics;
- latency percentiles, errors, and throughput;
- CPU, memory, restarts, and datastore metrics;
- pool, throttle, and cache observations;
- overload and recovery result;
- rollback threshold.

## Official Sources

- [Running OpenFGA in production](https://openfga.dev/docs/best-practices/running-in-production)
- [Current public configuration schema](https://github.com/openfga/openfga/blob/main/.config-schema.json)
- [Server configuration validation](https://github.com/openfga/openfga/blob/main/pkg/server/config/config.go)
