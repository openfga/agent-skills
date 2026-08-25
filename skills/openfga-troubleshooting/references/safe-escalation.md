---
title: Safe Escalation Bundle
---

# Safe Escalation Bundle

Escalate only after the symptom tree and synthetic reproduction have isolated a likely product defect or an unresolved operational failure.

## Redaction gate

Never include:

- API tokens, JWTs, client secrets, datastore usernames/passwords/URIs, authorization headers, cookies, private keys, or unredacted environment/config files
- Production user IDs, email addresses, group/team names, object IDs, tuple exports, usersets, condition values, contextual tuples, or sensitive request context
- Raw debug request/response bodies or telemetry payloads that may contain those values

Use stable synthetic replacements so repeated values remain traceable, for example `user:a`, `team:g1`, and `document:o1`. Preserve graph shape, tuple count/cardinality, condition value types, and query fan-out.

The official runtime guide mentions exporting tuples for reproduction. Treat any raw export as local sensitive material: never attach it. Produce a synthetic equivalent or obtain an approved confidential support channel and data-handling agreement.

## Bundle template

```markdown
## Symptom
- Operation:
- Expected:
- Actual OpenFGA error code/result:
- First observed (UTC):
- Frequency:
- User impact:

## Versions and topology
- OpenFGA server/image version:
- CLI or SDK name/version:
- Deployment shape and instance count:
- Datastore engine/version:
- API protocol and endpoint name (no credentials):

## Request identity
- Sanitized store/model aliases:
- User/relation/object aliases or list filter:
- Consistency preference:
- Context key names and value types only:
- Contextual tuple count and synthetic shape:
- UTC timestamp:
- X-Request-Id:
- Trace ID:

## Recent changes
- Model/config/deployment/datastore/client changes:
- Rollback or comparison result:

## Synthetic reproduction
- Attached repro.fga:
- Attached repro.fga.yaml:
- fga model validate result:
- fga model test result:
- Targeted CLI/API result:

## Sanitized configuration
- Auth method name:
- Cache setting names/states:
- Query/list deadline and result-limit names/values:
- Concurrency/throttling setting names/values:
- DB pool setting names/values:
- Experimental feature names:
- Logging/metrics/tracing setting names and sampling ratio:

## Observability
- p50/p95/p99 latency and RPS:
- Error rate and encoded error codes:
- DB query latency/count and active/idle connections:
- Cache hit ratio:
- CPU/memory/goroutine signals:
- Sanitized log lines keyed by request ID:
- Sanitized representative trace:
```

## Submission

- Include server startup logs at normal production verbosity after redaction.
- Include exact commands with secret arguments removed and synthetic identifiers substituted.
- State which fields were redacted or transformed.
- Use the OpenFGA server issue tracker for a sanitized reproducible defect. Use an approved confidential channel for information that cannot be safely public.
- For a security vulnerability or unexplained unauthorized allow, follow the repository security policy rather than filing a public issue.

## Official sources

- [Report OpenFGA runtime issues](https://openfga.dev/docs/getting-started/setup-openfga/reporting-runtime-issues)
- [Running OpenFGA in production](https://openfga.dev/docs/best-practices/running-in-production)
- [OpenFGA security policy](https://github.com/openfga/.github/blob/main/SECURITY.md)
