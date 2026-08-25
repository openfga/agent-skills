---
title: Scope and Compatibility
---

# Scope and Compatibility

Use change classification to produce candidate repositories, then prove or reject each candidate from current code.

## Discovery questions

Answer the applicable questions before editing:

1. What observable behavior or contract changes?
2. Which file is the source of truth, and which files are generated?
3. Which repositories import the changed module, type, grammar, schema, or released package?
4. Does the REST/OpenAPI surface change, or only an internal gRPC/server implementation?
5. Does a CLI command expose the change? Is its output parsed by scripts?
6. Do all official SDKs need a new surface, or only a generator/template fix for selected clients?
7. Would current docs, API guidance, configuration tables, or examples become false?
8. Is the source stable, experimental, or governed by an RFC/deprecation policy?
9. Which old/new client, server, CLI, configuration, model, and storage combinations must coexist?
10. What publication event unblocks each consumer: merge, Buf publication, Go pseudo-version, tagged release, package release, or docs deployment?
11. Which changelog or release-note mechanism does each repository actually use?
12. What evidence proves that a candidate repository is not affected?

## Classification matrix

| Change class | Start at | Candidate downstream impact | Evidence that narrows scope |
|--------------|----------|-----------------------------|-----------------------------|
| API endpoint, RPC, message, field, error, or HTTP mapping | `openfga/api` | server, SDK generator, affected SDKs, CLI, docs | Proto/OpenAPI diff; server handler imports; generator diff; CLI command usage; public docs |
| Authorization language syntax or parser behavior | `openfga/language` | server, CLI, docs | Grammar/package diff and consumer dependency/imports |
| Authorization evaluation or validation semantics | Usually `openfga/openfga`; use `openfga/language` if grammar/parser-owned | CLI local workflows and docs when behavior is exposed | Owning package, conformance tests, CLI embedded-server usage |
| Server config key, env var, flag, type, or default | `openfga/openfga` | released configuration page and manual docs/examples | `.config-schema.json` diff and docs generator input |
| CLI command, argument, exit behavior, or output | `openfga/cli` | CLI docs/examples only when public | Command and output package diff; no upstream contract change |
| Storage implementation or query behavior | `openfga/openfga` | Usually server only; docs/ops guidance if behavior or migration is visible | Storage interface/backend tests, schema or migration diff |
| SDK template, serialization, retry, or packaging behavior | `openfga/sdk-generator` for generated surfaces | Only affected SDK repositories | Generator/template diff; generated notices; per-client output diff |
| Deprecation or removal | Owning contract repository | Every active consumer of the deprecated surface | Code search, dependency graph, telemetry/RFC if available, compatibility policy |
| Release-only or documentation correction | Owning release/docs repository | Usually none | No source contract or behavior diff |

These are candidates, not mandatory edits.

## Compatibility review

### API and protobuf

- Prefer additive fields and methods when the protocol and project policy allow them.
- Preserve field numbers and wire meaning; do not reuse removed field numbers or silently change semantics.
- Check request validation, HTTP annotations, OpenAPI requiredness, errors, pagination, consistency, and default behavior.
- Run the repository's Buf breaking check. A passing structural check does not prove semantic compatibility.
- For a removal or rename, identify every generated client and direct proto consumer and define a deprecation path.

### Server and client coexistence

Specify expected results for:

| Combination | Question |
|-------------|----------|
| Old client -> new server | Does omitted new data retain the old behavior? |
| New client -> old server | Can the client detect unsupported functionality and return a useful error? |
| New CLI -> old server | Is capability/version handling needed, or must the command document a minimum server version? |
| Old CLI -> new server | Do existing commands and parsers keep working? |

Do not claim compatibility without a test, an existing protocol guarantee, or a clearly stated limitation.

### Authorization language and semantics

- Run existing models and conformance cases, not only new syntax tests.
- Distinguish parse/transform changes from server evaluation changes.
- Define behavior for models written before the change.
- Check CLI validation and transformation paths because the CLI consumes the language package separately.
- Document semantic changes even when syntax is unchanged.

### Configuration

- Preserve existing config files, environment variables, and flags unless a breaking change is intentional.
- Define the default and precedence among file, environment, and flag inputs.
- Test absent, valid, invalid, and deprecated values.
- If renaming, decide whether aliases coexist and for how long.
- Remember that the generated docs page reads the latest server release; plan the release/docs lag explicitly.

### CLI behavior and output

- Treat JSON and other machine-readable output as a compatibility surface.
- Cover field names, null/omitted behavior, ordering guarantees, exit codes, stdout/stderr routing, and error text relied on by automation.
- Human-readable output may change more freely, but document material UX changes and snapshot them when the repository does so.
- Avoid coupling a CLI PR to an unreleased server or SDK without a blocked dependency and test plan.

### Storage

- Test every affected backend, not only the default development backend.
- Define migration direction, rollback behavior, partial-upgrade behavior, and persisted-data compatibility.
- Consider mixed server versions during rolling deployment.
- Separate storage performance changes from observable query semantics.
- Require an API change only when the public contract changes.

### SDKs

- Compare generated diffs client by client; language templates can produce different public shapes.
- Check optional/required values, enum handling, unknown fields, naming, serialization, pagination, retries, and error types.
- Do not assume every generator client is officially supported.
- Release and test only affected SDKs, with evidence for exclusions.

### Deprecation and rollout

For each deprecated surface, record:

- replacement and migration instructions
- first release containing the deprecation
- warning mechanism, if one exists
- supported coexistence period or policy reference
- removal gate and affected consumers
- docs and release-note locations

Experimental status can change which compatibility policy applies, but it does not remove the need to state user impact and rollout order.
