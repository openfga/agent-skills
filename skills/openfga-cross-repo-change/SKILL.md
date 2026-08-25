---
name: openfga-cross-repo-change
description: Use this skill when planning, implementing, reviewing, or releasing an OpenFGA change that may span repositories, including protobuf or REST API endpoints and fields, authorization-model language semantics, server configuration, CLI behavior or output, storage behavior, SDK generation, documentation, compatibility, deprecation, or release sequencing. It maps evidence-based impact across openfga/api, openfga/openfga, openfga/cli, openfga/openfga.dev, openfga/language, openfga/sdk-generator, and official SDKs. Use it for cross-repo impact analysis, dependency ordering, linked PRs, version bumps, rollout plans, and completion checks; not for authorization-model design alone.
license: Apache-2.0
metadata:
  author: openfga
  version: "1.0.0"
---

# OpenFGA Cross-Repository Changes

Plan and deliver ecosystem changes from their real source of truth through only the consumers that evidence shows are affected.

## Non-Negotiable Rules

1. **Prove scope; do not blanket-edit repositories.** Mark a repository required only when a changed contract, dependency, generated artifact, user workflow, or release boundary reaches it. Record why every likely repository is included or excluded.
2. **Change sources, then regenerate.** Never hand-edit generated protobuf, OpenAPI, SDK, or documentation output. Find the owning source and repository command first.
3. **Re-check current `main`.** Repository structure, commands, dependencies, and release processes change. Inspect current files and CI before relying on this skill's repository map.
4. **Do not invent availability.** A downstream PR must reference an upstream commit, module version, or release that actually exists. If it does not exist yet, keep the PR blocked and document the required ref.
5. **Separate facts from plans.** Cite repository paths, dependency declarations, generated notices, CI workflows, or release docs as evidence. Label proposed sequencing and compatibility decisions as recommendations.
6. **Preserve independent delivery.** Use one focused branch and PR per repository unless that repository's maintainers require another structure. Link dependencies explicitly.

## Progressive Disclosure

Load only what the task needs:

| Reference | Read when |
|-----------|-----------|
| [Repository dependency map](references/repository-dependency-map.md) | Locating source-of-truth files, generated boundaries, consumers, or current validation/release conventions |
| [Scope and compatibility](references/scope-and-compatibility.md) | Classifying the change, deciding which repositories are affected, or evaluating compatibility and rollout risk |
| [Delivery and validation](references/delivery-and-validation.md) | Ordering branches and PRs, handling versions, collecting validation evidence, or completing a release |
| [Impact plan template](references/impact-plan-template.md) | Creating the working impact matrix and final completion record |

## Workflow

### 1. State the observable change

Write one sentence describing what users, clients, operators, model authors, or stored data will observe. Then classify it as one or more of:

- API endpoint, RPC, message, field, error, or wire contract
- authorization-model language, grammar, validation, or evaluation semantics
- server configuration flag, environment variable, schema, or default
- CLI command, argument, schema, exit behavior, or human/machine-readable output
- storage interface, query behavior, migration, or persisted-data behavior
- SDK surface or generation-template behavior
- documentation, example, deprecation, or release-only change

Read [Scope and compatibility](references/scope-and-compatibility.md) for the matching discovery questions and common impact paths.

### 2. Find the source of truth

Inspect current `main` in each candidate repository. Record:

- source file or schema that owns the behavior
- generated files and their generated notices
- generation command and CI diff check
- direct consumers from dependency manifests or imports
- release or publication boundary that makes the change consumable

Start with [Repository dependency map](references/repository-dependency-map.md), but verify every path and command before using it.

### 3. Build an evidence-based impact matrix

Copy [Impact plan template](references/impact-plan-template.md). For each candidate repository, set `Required?` to `yes`, `no`, or `pending`; never leave it implicit.

Evidence may include:

- a module dependency or imported type
- a generated artifact derived from the changed source
- a CLI command that exposes the behavior
- a public document or example that would become false
- a compatibility, migration, or release obligation

`No` is a useful conclusion when it includes evidence. For example, an internal storage optimization with no contract, config, or operational change may require only `openfga/openfga`.

### 4. Define compatibility before implementation

Describe old/new combinations and expected behavior:

- old client -> new server
- new client or CLI -> old server
- old configuration -> new server
- existing authorization models -> new language/server
- existing persisted data -> new/rolled-back server

Identify whether the change is additive, behavior-changing, deprecated, or breaking. Specify defaults, fallback behavior, migration, deprecation period, and rollback constraints. Do not treat an experimental package as permission to skip an explicit compatibility decision.

### 5. Order work by consumable dependencies

Build a dependency graph, not a calendar. A common public API path is:

```text
openfga/api source
  -> generated API artifacts and published commit/BSR module
  -> openfga/openfga implementation
  -> sdk-generator and affected official SDK releases
  -> openfga/cli consumption or UX
  -> openfga.dev user guidance
```

This is a starting path, not a mandate. Language changes begin in `openfga/language`; config-only and storage-only changes can begin in `openfga/openfga`; CLI-only changes can remain in `openfga/cli`.

For each edge, record the exact prerequisite: merged commit, pseudo-version, tagged release, generated specification, or documented behavior. See [Delivery and validation](references/delivery-and-validation.md).

### 6. Implement source-first and keep generated diffs reviewable

For each required repository:

1. Create a focused branch using the repository's convention.
2. Change the owning source.
3. Run the repository's generator, formatter, and targeted tests.
4. Inspect the generated diff for unexpected surface changes.
5. Add compatibility tests and release notes required by that repository.
6. Open a PR with upstream/downstream links and its blocked/unblocked state.

Do not combine hand-written behavior changes and unexplained generated churn.

### 7. Validate the ecosystem path

Collect commands and results, not assurances. At minimum:

- source schema or grammar checks pass
- generated artifacts match their sources
- server behavior and relevant storage matrices pass
- affected SDKs compile and test against the intended API
- CLI human and machine-readable output is covered when changed
- docs build and examples match released or explicitly upcoming behavior
- mixed-version and migration cases identified in step 4 are exercised or explicitly justified

Use the repository-specific guidance in [Delivery and validation](references/delivery-and-validation.md).

### 8. Close only when every matrix row is resolved

A cross-repository change is complete when:

- every candidate repository is `complete` or `not required` with evidence
- all dependency links point to real commits, versions, releases, or PRs
- generated outputs are reproducible
- compatibility and rollback decisions are documented
- changelogs, release notes, deprecations, and docs are complete where required
- validation evidence is attached to each PR
- temporary branches, replacements, or prerelease pins are removed

Report remaining blocked rows as blockers, not as completed work.

## Common Failure Modes

- Starting in the server for a public protobuf change instead of `openfga/api`
- Updating all SDK repositories when the OpenAPI surface did not change
- Hand-editing generated SDK code instead of changing `openfga/sdk-generator`
- Assuming the CLI consumes only one upstream module
- Publishing docs for an unreleased config schema as though it were already available
- Renaming machine-readable CLI fields without compatibility tests
- Omitting `CHANGELOG.md` in `openfga/openfga` or relying on release automation that the repository does not have
- Listing downstream work without links, dependency refs, owners, or validation evidence
