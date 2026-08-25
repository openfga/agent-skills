---
title: Authorization Result Decision Trees
---

# Authorization Result Decision Trees

## Unexpected allow or deny

1. **Distinguish an answer from an error.**
   - `allowed: false` means the defined relation did not resolve for those inputs.
   - A validation error such as `type_not_found`, `relation_not_found`, or `invalid_check_input` is not a deny. Correct the request/model mismatch first.
2. **Prove request identity.**
   - Compare API URL, store ID, authorization model ID, user, relation, object, request context, contextual tuples, and consistency.
   - Pin `authorization_model_id`. Models are immutable; omitting the ID selects the latest model and can silently change behavior after a model write.
   - Capture the model ID returned by the query response and compare it to the deployed application configuration.
3. **Check literal facts.**

   ```bash
   fga tuple read \
     --api-url "$FGA_API_URL" \
     --store-id "$FGA_STORE_ID" \
     --user user:anne \
     --relation viewer \
     --object document:roadmap \
     --consistency HIGHER_CONSISTENCY
   ```

   `Read` returns stored tuples only. It does not prove or disprove a computed permission.
4. **Classify the relation.**
   - Directly assignable: verify the exact tuple and its condition.
   - Computed/derived: inspect the model path; do not expect a tuple whose relation is the permission name.
   - Userset: verify the object/relation membership tuple and every link in the path.
   - Wildcard: look for a typed wildcard such as `user:*`; it can explain broad access without a user-specific tuple.
   - Condition: compare required context keys, types, and values. Persisted tuple context wins when it supplies the same key as request context.
5. **Remove request-only changes from the comparison.**
   - Contextual tuples apply only to that request.
   - A contextual tuple with the same user/relation/object key as a stored tuple takes precedence for that request.
   - Keep contextual tuples identical when comparing Check with ListObjects or ListUsers.
6. **Test read-after-write behavior.**
   - Repeat the query with `HIGHER_CONSISTENCY`.
   - OpenFGA query caches are disabled by default; confirm they were enabled before attributing staleness to cache invalidation. Otherwise inspect read-replica/datastore lag and any application-side cache.
   - If higher consistency fixes the symptom, do not make it permanent without evaluating latency and capacity.
7. **Reproduce with synthetic data.** Run the positive and negative cases through `fga model test`. If the authorization structure is wrong, use `skills/openfga` for the model change.

## Check versus ListObjects or ListUsers disagreement

Compare one tuple of inputs at a time:

| Input | Check | ListObjects | ListUsers |
|-------|-------|-------------|-----------|
| Store/model | Store ID and model ID | Same | Same |
| Subject | User | User | `user_filter` type and optional relation |
| Resource | Full object | Object type | Full object |
| Relation | Relation | Same relation | Same relation |
| Request additions | Context, contextual tuples, consistency | Same | Same |

Then follow this tree:

1. Run Check for one object returned by the list API and one expected object that is missing.
2. Confirm the ListUsers filter asks for the intended subject type. A user, userset such as `team:eng#member`, and typed wildcard are distinct results.
3. Confirm the relation is defined for the requested object type. Do not compare a direct relationship with a differently named computed permission.
4. Re-run all requests with the same model ID, context, contextual tuples, and `HIGHER_CONSISTENCY`.
5. Check server `listObjectsDeadline`, `listObjectsMaxResults`, `listUsersDeadline`, and `listUsersMaxResults`. ListObjects and ListUsers are bounded result computations, not continuation-token APIs; hitting a deadline or maximum can make a list appear incomplete.
6. Put Check, `list_objects`, and `list_users` assertions in the same `.fga.yaml` test. If the local test agrees but the deployment does not, return to configuration, data, consistency, and version evidence.

## Wrong store or model

- `store_id_not_found` or store ID validation errors: compare the explicit store ID with the application/CLI profile and target environment.
- `authorization_model_not_found` or `latest_authorization_model_not_found`: list models in the same store and pin the intended ID.

```bash
fga model list --api-url "$FGA_API_URL" --store-id "$FGA_STORE_ID"
fga model get --api-url "$FGA_API_URL" --store-id "$FGA_STORE_ID" --model-id "$FGA_MODEL_ID"
```

Do not fix a wrong-environment symptom by copying production tuples into another store. Correct the configuration and use synthetic test data.

## Official sources

- [Immutable authorization models](https://openfga.dev/docs/getting-started/immutable-models)
- [Relationship queries](https://openfga.dev/docs/interacting/relationship-queries)
- [Perform a Check](https://openfga.dev/docs/getting-started/perform-check)
- [Contextual tuples](https://openfga.dev/docs/interacting/contextual-tuples)
- [Conditions](https://openfga.dev/docs/modeling/conditions)
- [Consistency](https://openfga.dev/docs/interacting/consistency)
