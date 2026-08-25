---
title: Model and Tuple Decision Trees
---

# Model and Tuple Decision Trees

## Model validation or write failure

1. Validate locally before calling the server:

   ```bash
   fga model validate --file repro.fga
   fga model test --tests repro.fga.yaml
   ```

2. Classify the error:
   - Syntax/parser failure: reduce to the reported type, relation, condition, or module.
   - `invalid_authorization_model`, `type_not_found`, or `relation_not_found`: verify schema references and type restrictions.
   - `authorization_model_resolution_too_complex`: capture the exact model and server depth/breadth limits; do not raise limits before simplifying a synthetic reproduction.
   - Entity/size limit: record the actual count/size and documented limit.
3. If local validation passes but `model write` fails, compare CLI and server versions, input format, target store, and server error code.
4. Remember that a successful write creates a new immutable model ID. Update the application configuration deliberately; do not rely on "latest" during diagnosis.
5. For structural review, relation migration, or refactoring, switch to [`skills/openfga`](../../openfga/SKILL.md).

Targeted write:

```bash
fga model write \
  --api-url "$FGA_API_URL" \
  --store-id "$FGA_STORE_ID" \
  --file repro.fga
```

Use a disposable diagnostic store unless the user has explicitly approved a production model rollout.

## Missing, stale, or incorrect tuple

1. Read by the complete tuple key with `HIGHER_CONSISTENCY`.
2. Verify user and object type prefixes, relation spelling, userset syntax, and condition name.
3. Verify the model allows that user type/userset/wildcard on the relation. A tuple can be syntactically shaped like a fact while being invalid under the selected model.
4. Check whether the application wrote to a different store or omitted the pinned model ID on the subsequent query.
5. Compare recent changes with `fga tuple changes`; preserve its continuation token and type filter together.
6. If default consistency misses a just-written tuple but `HIGHER_CONSISTENCY` sees it, diagnose cache/replica behavior rather than writing a duplicate.

## Tuple write or delete failure

Use the positional order `user relation object`:

```bash
fga tuple write \
  --api-url "$FGA_API_URL" \
  --store-id "$FGA_STORE_ID" \
  user:anne viewer document:roadmap
```

Decision tree:

1. `invalid_write_input`, `write_failed_due_to_invalid_input`, or `invalid_tuple`: inspect the reported tuple against the pinned model's type restrictions.
2. Duplicate key:
   - Determine whether the exact tuple already exists.
   - Use `--on-duplicate ignore` only when idempotency is intended and documented.
   - A duplicate key with conflicting condition data is not equivalent; correct the write source.
3. Delete of a missing tuple:
   - Confirm store and tuple key.
   - Use `--on-missing ignore` only for intentionally idempotent cleanup.
4. Condition failure:
   - Supply the exact condition name.
   - Ensure context is valid JSON and its values have the CEL-declared types.
   - Keep sensitive condition context out of shell history and diagnostic output.
5. Batch/file failure:
   - Reduce to one failing tuple.
   - Respect the CLI/server tuple-per-write limit and rate/concurrency controls.
   - Keep tuple subjects synthetic in shared artifacts.

Never "repair" an unexplained deny by adding a broad wildcard or direct permission tuple. Prove the intended graph path first.

## Official sources

- [CLI documentation](https://openfga.dev/docs/getting-started/cli)
- [Update relationship tuples](https://openfga.dev/docs/getting-started/update-tuples)
- [Immutable authorization models](https://openfga.dev/docs/getting-started/immutable-models)
- [Migrating relations](https://openfga.dev/docs/modeling/migrating/migrating-relations)
