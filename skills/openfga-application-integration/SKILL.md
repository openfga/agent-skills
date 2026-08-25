---
name: openfga-application-integration
description: Product-user guidance for application developers integrating their services with a running OpenFGA deployment. Use when configuring an OpenFGA SDK or REST client, selecting a store and immutable authorization model ID, authenticating without embedded secrets, writing or deleting relationship tuples, calling Check, BatchCheck, ListObjects, or ListUsers, using contextual tuples or conditions, handling consistency and read-after-write behavior, or designing retries, timeouts, caching, integration tests, and production smoke checks. Refer authorization model design to the openfga skill.
license: Apache-2.0
metadata:
  author: openfga
  version: "1.0.0"
---

# OpenFGA Application Integration

Use this product-user skill to wire an application to a running OpenFGA service safely. It is for application developers consuming OpenFGA, not contributors changing an OpenFGA repository.

Keep the boundary clear:

- Use this skill for stores, model rollout, client configuration, tuple lifecycle, authorization queries, reliability, security, and operational verification.
- Use the sibling [`openfga`](../openfga/SKILL.md) skill to design or refactor types, relations, permissions, conditions, tuples as modeling concepts, and `.fga.yaml` model tests.
- Do not redesign the authorization model as a side effect of integration work. Surface the modeling requirement and switch to the modeling skill.

## Choose the Integration Surface

| Surface | Use it for | Do not use it for |
|---|---|---|
| Official SDK | Runtime calls from JavaScript/TypeScript, Go, Python, Java, or .NET services | Hiding store/model lifecycle decisions |
| Server API | Unsupported languages, constrained runtimes, or API operations not exposed by an SDK | Reimplementing SDK auth, retry, and connection behavior without need |
| `fga` CLI | Provisioning, model validation/tests, imports, diagnostics, and explicit smoke checks | Spawning a process in an application authorization path |

Default to an official SDK in a long-running service. Reuse the client so its HTTP connections and authentication state are reused.

## Required Workflow

1. **Establish ownership and identifiers.**
   Decide which deployment process owns the store, authorization model, and tuple migrations. Provision stores outside application startup. Persist the returned store ID and pin an immutable authorization model ID. See [store and model lifecycle](references/store-and-model-lifecycle.md).

2. **Configure one reusable client.**
   Read API URL, store ID, model ID, and credentials from deployment configuration or a secret manager. Require TLS outside local development. Set bounded transport and operation deadlines. See [SDK source map](references/sdk-source-map.md).

3. **Define the data boundary.**
   Keep resource metadata and search data in the application database. Store only stable, non-sensitive identifiers and relationships in OpenFGA. Never place credentials, PII, or resource names in examples, logs, correlation IDs, tuple identifiers, condition context, or custom headers.

4. **Implement tuple mutations deliberately.**
   Couple application-state changes and tuple changes through an explicit workflow such as an outbox, reconciliation job, or compensating action. Keep one OpenFGA Write transactional when replacing permissions or preserving an invariant. Treat SDK chunked/non-transactional bulk modes as partial-success operations. See [tuples and authorization queries](references/tuples-and-queries.md).

5. **Choose the narrowest authorization query.**
   Use Check for one Boolean decision. Use server BatchCheck for multiple independent decisions. Use ListObjects or ListUsers only when enumeration is the product requirement, not as a substitute for search or data retrieval.

6. **Specify request-local inputs.**
   Use contextual tuples only for ephemeral relationships that should affect one request. Pass condition values in query `context`; do not confuse them with the context stored on a conditional tuple. Pin the model ID on every query through client configuration or request options.

7. **Choose consistency per user flow.**
   Use default/minimize-latency reads normally. Request `HIGHER_CONSISTENCY` only where the flow requires read-after-write freshness and accepts extra latency and load. OpenFGA does not return a write consistency token.

8. **Bound failure behavior.**
   Pair retries with timeouts and cancellation. Retry only documented transient failures, honor `Retry-After`, and never turn a validation/auth/model error into a denial. Make write retries intentionally idempotent or reconcile unknown outcomes. See [reliability and security](references/reliability-and-security.md).

9. **Verify before rollout.**
   Run model tests, integration tests against a disposable store, and low-exposure production smoke checks. Confirm both known-allow and known-deny behavior under the pinned model. See [testing and operations](references/testing-and-operations.md).

## Non-Negotiable Review Checks

- Store creation is not on a request or normal startup path.
- Runtime clients pin an authorization model ID rather than silently using the latest model.
- Secrets are absent from code, fixtures, logs, and generated documentation.
- A `false` Check is handled as denial; an API/transport error is not converted to denial or allow.
- Writes account for duplicate, missing-delete, partial-success, and unknown-outcome behavior.
- Search queries retrieve application data; OpenFGA only authorizes or supplies IDs to intersect.
- ListObjects/ListUsers callers account for unordered, bounded, non-paginated results.
- Contextual tuples and condition context are validated, bounded, and non-sensitive.
- Higher consistency is scoped to flows that need it.
- Every outbound call has a deadline; Go and .NET callers propagate native cancellation.
- Application decision caches have a documented TTL, invalidation source, stale-access risk, and final-Check strategy.
- Smoke checks expose no broad user or object list.

## Reference Map

| Reference | Open when |
|---|---|
| [Store and model lifecycle](references/store-and-model-lifecycle.md) | Provisioning stores, rolling models, or choosing auth/configuration |
| [Tuples and authorization queries](references/tuples-and-queries.md) | Writing/deleting tuples or implementing Check/BatchCheck/ListObjects/ListUsers |
| [Reliability and security](references/reliability-and-security.md) | Designing timeouts, retries, batching, errors, metadata, caching, or exposure controls |
| [Testing and operations](references/testing-and-operations.md) | Building local/integration tests, migrations, observability, or smoke checks |
| [SDK source map](references/sdk-source-map.md) | Implementing a language-specific client without copying an SDK README |
