---
name: openfga-troubleshooting
description: Evidence-first troubleshooting for application developers and operators using the OpenFGA product. Use when diagnosing unexpected allow or deny results; disagreement between Check, ListObjects, or ListUsers; wrong stores or authorization model IDs; stale, missing, invalid, conditional, wildcard, userset, or contextual tuples; consistency and read-after-write behavior; model or tuple write failures; authentication, TLS, endpoint, CLI, or SDK configuration errors; server startup, datastore migration, pagination, limits, timeouts, throttling, or slow queries; or when preparing a safe OpenFGA runtime issue report.
license: Apache-2.0
metadata:
  author: openfga
  version: "1.0.0"
---

# OpenFGA Product Troubleshooting

Use this skill for an observed problem in a deployed OpenFGA product or an application integration. The audience is application developers and operators, not contributors debugging `openfga/openfga` source code.

This skill complements the [`openfga` modeling skill](../openfga/SKILL.md). If evidence shows that the authorization model itself needs structural review, redesign, or refactoring, switch to that skill. Keep this workflow focused on moving from a symptom to evidence, a minimal reproduction, and the smallest verified fix.

## Safety rules

- Never request, print, commit, or attach API tokens, client secrets, JWTs, datastore credentials or URIs, private keys, raw authorization headers, or unredacted configuration.
- Never expose production tuple subjects, object identifiers, condition context, contextual tuples, or other sensitive application data. Prefer synthetic data with the same graph shape and cardinality.
- Do not change production data, consistency, limits, caches, or authentication merely to test a theory. Reproduce safely first, then use a controlled rollback plan.
- Treat an unexpected allow as a security incident until the exact model, tuples, context, and request path explain it.
- Record exact evidence. Do not infer that two requests are equivalent because their user-facing intent sounds equivalent.

## Evidence-first workflow

1. **State one observable symptom.** Capture the operation, expected result, actual result or error code, timestamp, and whether it is consistent or intermittent.
2. **Freeze request identity.** Record the server and client/CLI versions, API protocol and endpoint name, store ID, authorization model ID, user, relation, object or object type, user filter, context keys and value types, contextual tuple count, consistency preference, and request ID. Redact values as required.
3. **Re-run one targeted request.** Use explicit `--api-url`, `--store-id`, and `--model-id` values where the CLI supports them. Do not rely on "latest model" or an implicit CLI/SDK profile while isolating the problem.
4. **Choose the matching symptom tree.**

   | Symptom | Open |
   |---------|------|
   | Unexpected allow/deny, API disagreement, wrong store/model, tuple, userset, wildcard, condition, context, or consistency | [Authorization results](references/authorization-results.md) |
   | Model validation/write or tuple read/write/delete failure | [Models and tuples](references/models-and-tuples.md) |
   | Authentication, authorization, endpoint, network, TLS, CLI, or SDK mismatch | [Connectivity and clients](references/connectivity-and-clients.md) |
   | Startup, migration, datastore, pagination, limits, latency, timeout, or throttling | [Operations and performance](references/operations-and-performance.md) |

   For version-sensitive flags, defaults, error codes, and telemetry behavior, confirm the deployed release against [Official source pointers](references/official-sources.md).

5. **Build a synthetic minimal reproduction.** Follow [Minimal reproduction](references/minimal-reproduction.md). Require both the intended allow and a nearby deny, and include Check plus ListObjects/ListUsers when the symptom crosses query APIs.
6. **Separate product behavior from model design.** If the synthetic model reproduces the issue, identify the smallest input/configuration correction. If the model expresses the wrong structure, refer the structural change to `skills/openfga`.
7. **Verify the fix.** Re-run `fga model validate`, `fga model test`, and the targeted request with the same explicit store, model, context, contextual tuples, and consistency settings. Confirm the negative case remains denied.
8. **Escalate only with sanitized evidence.** Use [Safe escalation bundle](references/safe-escalation.md). Never attach a raw production tuple export or secret-bearing configuration.

## Fast triage order

For authorization symptoms, eliminate causes in this order:

1. Wrong endpoint, store ID, or authorization model ID.
2. Different user/relation/object, user filter, context type, contextual tuples, or consistency preference.
3. Missing, stale, duplicate, malformed, or condition-bearing tuples.
4. Direct relation versus computed permission, userset, wildcard, or condition semantics.
5. Read-after-write cache or replica behavior.
6. List result deadline/maximum limits or a client pagination bug.
7. Product error, only after a synthetic reproduction survives the preceding checks.

## Finish only when

- The exact store and immutable authorization model version are known.
- The minimal reproduction passes `fga model validate` and `fga model test`.
- The fix explains the original evidence instead of merely changing the answer.
- Positive and negative behavior is verified, including all affected query APIs.
- No diagnostic artifact contains secrets or production subject/context data.
- Remaining product defects have a sanitized request ID, timeline, versions, configuration names, logs, telemetry, and reproduction bundle.
