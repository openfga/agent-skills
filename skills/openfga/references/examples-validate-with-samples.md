---
title: Validate Against Sample Stores
---

## Validate Against Sample Stores

Sample stores can be run, not just read. Run a sample's tests to see how it is expected to behave. Adapt it while keeping those tests green. Load it into a server to try API and SDK calls against realistic data. All commands below use the [OpenFGA CLI](https://github.com/openfga/cli) (see `test-cli`).

### Get the Samples

Clone the repository to get every store:

```bash
git clone --depth 1 https://github.com/openfga/sample-stores.git openfga-sample-stores
cd openfga-sample-stores
fga model test --tests "stores/github/store.fga.yaml"
```

To get a single store without cloning, fetch `store.fga.yaml` and every file it references through `model_file` or `tuple_file`:

```bash
mkdir github && cd github
curl -sSLO https://raw.githubusercontent.com/openfga/sample-stores/main/stores/github/store.fga.yaml
grep -E '^(model_file|tuple_file):' store.fga.yaml
# model_file: model.fga
curl -sSLO https://raw.githubusercontent.com/openfga/sample-stores/main/stores/github/model.fga
fga model test --tests store.fga.yaml
```

```text
# Test Summary #
Tests 4/4 passing
Checks 6/6 passing
ListObjects 1/1 passing
ListUsers 3/3 passing
```

`--tests` also accepts a glob, so one command can run a store split across several files, or every store:

```bash
fga model test --tests "stores/modeling-guide/*.fga.yaml"
fga model test --tests "stores/*/*.fga.yaml"
```

### Adapt With the Tests Still Passing

The commands below run from inside the `openfga-sample-stores` clone and put the adapted copy in `../authz`, outside the clone.

**Incorrect (copying the model and leaving the tests behind):**

```bash
cp stores/github/model.fga ../authz/model.fga
# rename repo -> project, delete a few relations, ship it
```

The sample's tests prove that the sample works, not that your copy does. Renaming or removing a relation can change who gets access, and without tests nothing reports it.

**Correct (copy the model with its tests, then change both together):**

```bash
mkdir -p ../authz
cp stores/github/{model.fga,store.fga.yaml} ../authz/
fga model test --tests ../authz/store.fga.yaml   # green baseline before any change
# Make one change at a time to model.fga, then update the tuples and tests in
# store.fga.yaml to match, and re-run until green.
```

Once the adapted model is in place, its tests should use the application's own types and IDs:

```yaml
name: Projects
model_file: model.fga
tuples:
  - user: organization:acme
    relation: owner
    object: project:website
  - user: organization:acme#member
    relation: project_reader
    object: organization:acme
  - user: user:erik
    relation: member
    object: organization:acme
  - user: team:frontend#member
    relation: writer
    object: project:website
  - user: team:design#member
    relation: member
    object: team:frontend
  - user: user:diane
    relation: member
    object: team:design
tests:
  - name: Organization base role and nested teams
    check:
      - user: user:erik
        object: project:website
        assertions:
          can_read: true
          can_push: false
      - user: user:diane
        object: project:website
        assertions:
          can_read: true
          can_push: true
      - user: user:mallory
        object: project:website
        assertions:
          can_read: false
          can_push: false
    list_users:
      - object: project:website
        user_filter:
          - type: user
        assertions:
          can_push:
            users:
              - user:diane
```

Treat the sample's tests as a coverage checklist. The `github` tests, for example, cover nested team membership, organization base roles, and role inheritance. For each scenario, either keep an equivalent test or drop it on purpose because the application does not need it. Then add tests for the application's own rules, including negative checks such as `user:mallory` above.

Keep `model_file` and `tuple_file` paths inside the directory that holds the test file. Recent CLI versions reject references that escape it (`path escapes from parent`) unless you pass `--allow-external-files`.

### Try API and SDK Calls Against Sample Data

`fga store import` creates a store, writes the model, and writes the tuples. That gives you realistic data to call from an application, the CLI, or the HTTP API. Use a local or development server only.

```bash
export FGA_API_URL=http://localhost:8080
OUT=$(fga store import --file stores/github/store.fga.yaml)
FGA_STORE_ID=$(echo "$OUT" | jq -r '.store.id')
FGA_MODEL_ID=$(echo "$OUT" | jq -r '.model.authorization_model_id')

fga query check --store-id "$FGA_STORE_ID" --model-id "$FGA_MODEL_ID" user:erik admin repo:openfga/openfga
# {"allowed":true,"resolution":""}
fga query list-objects --store-id "$FGA_STORE_ID" --model-id "$FGA_MODEL_ID" user:anne reader repo
# {"objects":["repo:openfga/openfga"]}
```

The store's tests already state the expected answers. Make the same calls from the application and compare its results with those assertions.

`mcp-gateway` relies on the experimental Dynamic Conditions feature (`$expression` conditions). `fga model test` enables it automatically, so its tests run without a server. Loading it into a server takes more:

- The server must be OpenFGA v1.21.0 or later, started with `openfga run --experimentals inline_expressions`. Otherwise writing the model fails with `$expression requires the "inline_expressions" experimental feature flag`.
- `fga store import` (CLI v0.8.1) rejects tuples conditioned with `$expression`, so it cannot import `mcp-gateway.fga.yaml` or `multi-tenant-mcp-gateway.fga.yaml`. Write the model with `fga model write`, then send those tuples to `POST /stores/{store_id}/write` with the same `condition` as in the store file.
- `multi-tenant-mcp-gateway-intent.fga.yaml` has a store name longer than the 64-character limit, so create a store first and import into it with `--store-id`.

### Rules

- Run a sample's tests before changing anything. Any failure after that point comes from your changes.
- Keep a `.fga.yaml` test file next to every model you adapt, and run `fga model test` after each change.
- Do not delete a sample's test scenario unless the application deliberately does not need that behavior.
- Import sample data only into local or development stores, never into production.
