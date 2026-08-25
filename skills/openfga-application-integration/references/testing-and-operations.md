# Testing and Operations

## Test layers

### Model tests

Use the sibling [`openfga`](../../openfga/SKILL.md) modeling skill to author `.fga.yaml` expectations for:

- known allows and denials;
- Check, ListObjects, and ListUsers;
- wildcard plus exclusion behavior;
- contextual tuples;
- condition boundaries and missing/invalid context.

Run:

```bash
fga model validate --file model.fga
fga model test --tests store.fga.yaml
```

Current CLI model tests use an embedded OpenFGA server and do not require production state.

### Application unit tests

Wrap the SDK behind a narrow authorization interface. Unit-test:

- exact user/relation/object construction;
- model/store selection;
- distinction between denial and errors;
- cancellation/deadline propagation;
- BatchCheck correlation and item errors;
- tuple mutation duplicate/missing policies;
- search-and-authorize pagination behavior.

Use fakes only for application branching. Do not use a mock to prove the OpenFGA model behaves correctly.

### Integration tests

Run against a disposable store on the same OpenFGA topology and authentication mode used by the target environment:

1. Create the store during test setup.
2. Write the tested model and capture its immutable ID.
3. Configure the real official SDK with that store/model pair.
4. Write representative tuples transactionally.
5. Exercise known allow/deny Check and relevant BatchCheck/List operations.
6. Test contextual tuples, condition context, and read-after-write with the intended consistency.
7. Exercise timeouts, cancellation, duplicate writes, missing deletes, and retryable failures where the environment permits.
8. Delete the disposable store in teardown, while preserving cleanup failures in test output.

Never point destructive integration tests at a shared production store.

## Migration verification

Before switching a model ID:

- run the complete model test suite;
- sample or replay representative production-shaped queries with sanitized IDs;
- verify tuple migration counts and rejected tuples;
- shadow the old and new model decisions when possible;
- define rollback as the prior application/model pair, not only the prior model ID;
- monitor validation errors, denial-rate shifts, latency, and retry volume during rollout.

## Production smoke checks

Keep smoke checks low exposure and normally non-mutating:

1. Confirm the configured store exists.
2. Read the configured immutable model ID.
3. Check one synthetic known allow.
4. Check one synthetic known deny.
5. Use tight deadlines and the same auth path as the application.

Use `HIGHER_CONSISTENCY` only when freshness itself is under test. Do not use ListUsers as a health check and do not create stores, write models, or mutate real user access in a routine liveness probe.

The CLI is useful for an operator-triggered smoke check, but runtime health endpoints should use the same SDK/API client path as application requests.

## Operational checklist

- Store and model IDs identify the expected environment and release.
- Provisioning credentials are separate from runtime credentials where possible.
- Client initialization fails on missing configuration.
- Dashboards separate denies from integration/infrastructure errors.
- Alerts cover validation errors, auth failures, timeout rate, retries, and latency.
- Tuple workflows expose backlog, retries, dead letters, and reconciliation drift.
- Cache rollout includes revocation and model-change tests.
- Runbooks include credential rotation, model rollback, and tuple reconciliation.

## Source pointers

- [Testing authorization models](https://openfga.dev/docs/modeling/testing)
- [OpenFGA CLI](https://github.com/openfga/cli)
- [CLI documentation](https://openfga.dev/docs/getting-started/cli)
