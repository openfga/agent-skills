---
title: Minimal Reproduction
---

# Minimal Reproduction

Use synthetic names and the smallest graph that preserves the symptom. Do not copy production subjects, object IDs, condition values, or contextual tuples.

## Files

Create `repro.fga`:

```fga
model
  schema 1.1

type user

type document
  relations
    define editor: [user]
    define viewer: [user] or editor
    define can_view: viewer
```

Create `repro.fga.yaml`:

```yaml
name: Troubleshooting reproduction

model: |
  model
    schema 1.1

  type user

  type document
    relations
      define editor: [user]
      define viewer: [user] or editor
      define can_view: viewer

tuples:
  - user: user:anne
    relation: editor
    object: document:roadmap
  - user: user:bob
    relation: viewer
    object: document:handbook

tests:
  - name: Cross-query agreement
    check:
      - user: user:anne
        object: document:roadmap
        assertions:
          can_view: true
      - user: user:mallory
        object: document:roadmap
        assertions:
          can_view: false
    list_objects:
      - user: user:anne
        type: document
        assertions:
          can_view:
            - document:roadmap
    list_users:
      - object: document:roadmap
        user_filter:
          - type: user
        assertions:
          can_view:
            users:
              - user:anne
```

Replace this model with the smallest relevant direct, computed, userset, wildcard, or conditional path. Preserve one allowed and one denied case.

## Required local gates

```bash
fga model validate --file repro.fga
fga model test --tests repro.fga.yaml
```

Do not continue to deployment requests until both commands succeed.

## Targeted deployment comparison

Use explicit identifiers and the same request additions:

```bash
fga query check \
  --api-url "$FGA_API_URL" \
  --store-id "$FGA_STORE_ID" \
  --model-id "$FGA_MODEL_ID" \
  user:anne can_view document:roadmap \
  --consistency HIGHER_CONSISTENCY

fga query list-objects \
  --api-url "$FGA_API_URL" \
  --store-id "$FGA_STORE_ID" \
  --model-id "$FGA_MODEL_ID" \
  user:anne can_view document \
  --consistency HIGHER_CONSISTENCY

fga query list-users \
  --api-url "$FGA_API_URL" \
  --store-id "$FGA_STORE_ID" \
  --model-id "$FGA_MODEL_ID" \
  --object document:roadmap \
  --relation can_view \
  --user-filter user \
  --consistency HIGHER_CONSISTENCY
```

Add `--context` and repeated `--contextual-tuple` arguments only when they are part of the symptom. Use synthetic values in saved transcripts.

## Evidence table

| Case | Expected | Local test | Targeted request | Store/model | Context/tuples | Consistency | Request ID |
|------|----------|------------|------------------|-------------|----------------|-------------|------------|
| intended allow | allow | | | redacted | synthetic/none | | |
| nearby deny | deny | | | redacted | synthetic/none | | |

If the local and deployment results differ, inspect configuration/data/version. If both reproduce an incorrect intended structure, refer model design work to `skills/openfga`.

## Official sources

- [OpenFGA CLI](https://openfga.dev/docs/getting-started/cli)
- [Relationship queries](https://openfga.dev/docs/interacting/relationship-queries)
- [Testing authorization models](https://openfga.dev/docs/modeling/testing)
