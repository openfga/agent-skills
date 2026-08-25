---
title: Impact Plan Template
---

# Impact Plan Template

Copy and maintain this document for the change. Delete rows that are demonstrably irrelevant only after recording the exclusion in the decision log.

## Change statement

- **Observable change:**
- **Classification:**
- **Compatibility level:** additive / behavior-changing / deprecated / breaking
- **Source-of-truth repository and path:**
- **Generated boundaries:**
- **Rollout or rollback constraint:**

## Discovery record

| Question | Answer | Evidence |
|----------|--------|----------|
| What owns the changed contract or behavior? | | |
| What is generated from it? | | |
| What consumes it directly? | | |
| What user-facing workflow changes? | | |
| What release/publication event unblocks consumers? | | |
| Which old/new combinations must work? | | |

## Repository impact matrix

| Repository | Required? | Evidence | Source or generated change | Depends on | Compatibility work | Validation | Branch / PR / version | Status |
|------------|-----------|----------|----------------------------|------------|--------------------|------------|-----------------------|--------|
| `openfga/api` | pending | | | | | | | discovery |
| `openfga/language` | pending | | | | | | | discovery |
| `openfga/openfga` | pending | | | | | | | discovery |
| `openfga/sdk-generator` | pending | | | | | | | discovery |
| `openfga/js-sdk` | pending | | | | | | | discovery |
| `openfga/go-sdk` | pending | | | | | | | discovery |
| `openfga/dotnet-sdk` | pending | | | | | | | discovery |
| `openfga/python-sdk` | pending | | | | | | | discovery |
| `openfga/java-sdk` | pending | | | | | | | discovery |
| `openfga/cli` | pending | | | | | | | discovery |
| `openfga/openfga.dev` | pending | | | | | | | discovery |

Allowed status values: `discovery`, `blocked`, `in progress`, `validation`, `complete`, `not required`.

For `not required`, fill the evidence column. For `blocked`, fill `Depends on` with a real PR, commit, publication, or release requirement.

## Dependency order

```text
[source PR]
  -> [published commit/module/specification]
  -> [consumer PR and release]
  -> [next consumer]
  -> [documentation/release completion]
```

## Compatibility cases

| Producer / consumer combination | Expected behavior | Test or evidence | Result |
|---------------------------------|-------------------|------------------|--------|
| Old client -> new server | | | |
| New client -> old server | | | |
| Old CLI -> new server | | | |
| New CLI -> old server | | | |
| Old config/model/data -> new server | | | |
| New server -> rollback version | | | |

Mark inapplicable rows `N/A` with a reason.

## Decision log

| Decision | Evidence | Consequence |
|----------|----------|-------------|
| | | |

## Final evidence

| Repository | Validation command or CI check | Result link or output | Changelog/docs/release complete? |
|------------|--------------------------------|-----------------------|----------------------------------|
| | | | |

Finish against the checklist in [Delivery and validation](delivery-and-validation.md).
