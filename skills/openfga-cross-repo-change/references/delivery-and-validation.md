---
title: Delivery and Validation
---

# Delivery and Validation

Order work by dependency availability and collect repository-specific evidence.

## Dependency paths

### Public API change

1. **`openfga/api`**
   - Change canonical proto definitions.
   - Run the repository generator and inspect protobuf and OpenAPI output.
   - Pass lint, formatting, breaking, generated-diff, and OpenAPI validation.
   - Merge before consumers resolve the new API commit and Buf publication.
2. **`openfga/openfga`**
   - Resolve `github.com/openfga/api/proto` at the merged commit.
   - Implement behavior and compatibility tests.
   - Add the required `CHANGELOG.md` entry unless an approved repository exemption applies.
   - Release when downstream work requires a server tag or image.
3. **`openfga/sdk-generator` and affected SDKs**
   - Record the exact API OpenAPI document commit.
   - Update generator templates/configuration only when needed.
   - Regenerate each affected client and inspect its public diff.
   - Test and release each required SDK through its own repository process.
4. **`openfga/cli`**
   - Bump only the dependencies actually needed: API proto commit, Go SDK release, server release, or language release.
   - Implement command and output behavior.
   - Keep the PR blocked until required versions exist.
5. **`openfga/openfga.dev`**
   - Update human-written endpoint, semantics, migration, and example content when it becomes inaccurate.
   - Let the configuration-page generator consume released server schema; do not present unreleased config as generally available.

Independent documentation can be drafted in parallel, but publish wording must distinguish released, preview, and planned behavior.

### Language or model-semantics change

1. Start in `openfga/language` when grammar, parsing, or transformation owns the change.
2. Release or publish the language package according to that repository's process.
3. Update server and CLI dependencies independently; both consume the Go language package.
4. Add server evaluation changes and compatibility cases if semantics extend beyond parsing.
5. Update configuration-language, modeling, or migration docs where user behavior changes.

If the language syntax is unchanged and only evaluation changes, prove that the server is the source and omit `openfga/language`.

### Configuration change

1. Change server config source and `.config-schema.json` together through repository mechanisms.
2. Test flags, environment variables, config files, precedence, defaults, and invalid values.
3. Add server changelog/release notes.
4. Release the server.
5. Confirm the docs automation produces the configuration-page change from that latest release.
6. Manually update surrounding setup examples when the generated table is insufficient.

### CLI-only or storage-only change

Keep the matrix narrow unless evidence shows propagation:

- CLI-only behavior can remain in `openfga/cli`, plus docs that explicitly describe it.
- Storage-only behavior can remain in `openfga/openfga`, with all affected backend and migration tests.

## Branches, versions, and PR links

- Use a focused branch in each repository; follow that repository's naming and base-branch conventions.
- Use the same short topic in PR titles or descriptions when it helps discovery, but do not assume branches can be shared across repositories.
- Put dependency links in the PR body using clear relations such as `blocked by`, `followup`, or `depends on`.
- Record the exact upstream commit, generated specification commit, pseudo-version, or release consumed.
- For the API Go module, resolve the merged commit to the current Go pseudo-version rather than inventing a semantic version.
- For server, CLI, language, and SDK packages, use releases created by their actual release process. Do not predict or hardcode the next version.
- Remove temporary `replace` directives, local paths, prerelease tarballs, or unpublished pins before declaring completion.
- If maintainers need review before upstream publication, open a draft or blocked PR with explicit non-merge instructions instead of fabricating a dependency.

## Validation evidence by repository

Inspect current contribution docs, Makefiles, package scripts, and CI first. Commands below are current discovery anchors, not immutable APIs.

| Repository | Minimum relevant evidence |
|------------|---------------------------|
| `openfga/api` | Repository generation (`make`/`make all` as currently defined); no generated diff; Buf lint, formatting, and breaking checks; OpenAPI validation |
| `openfga/language` | Grammar generation/format checks; package tests for affected languages; old and new model parsing/transformation cases |
| `openfga/openfga` | Targeted package tests; `make test-unit`; `make test-storage` for storage/config persistence changes; `make test-matrix` for integration/server paths; generated/config schema consistency |
| `openfga/sdk-generator` | Regenerate affected clients; inspect deterministic diff; `make test-all-clients` or narrower current client target; template/config tests |
| Official SDK | Repository build, formatting, unit tests, serialization tests, and live/integration tests required by that SDK; generated source matches generator input |
| `openfga/cli` | Current Go test/lint workflow; command tests; old/new server cases; golden/snapshot or structured-output tests when output changes |
| `openfga/openfga.dev` | Current `make check-all` or equivalent package scripts covering format, lint, typecheck, circular dependencies, and build; validate links and examples |

Attach the command and outcome to the corresponding PR. If a full matrix cannot run locally, state what ran, what CI covers, and why the omitted checks are still pending.

## Changelog and release conventions

| Repository | Current convention to verify |
|------------|------------------------------|
| `openfga/api` | No repository changelog observed; merge plus configured Buf publication is the contract availability boundary |
| `openfga/language` | release-please; conventional commits feed release notes |
| `openfga/openfga` | Hand-written Keep a Changelog entry enforced for applicable PRs; repository labels may grant explicit exemptions |
| `openfga/sdk-generator` / SDKs | Per-client generated and repository release processes; inspect the current client changelog and release workflow |
| `openfga/cli` | release-please; conventional commit type affects generated changelog section |
| `openfga/openfga.dev` | No product changelog requirement observed; describe scope and release applicability in the PR |

Do not copy one repository's release mechanics to another.

## Cross-repository completion checklist

- [ ] Observable change and classification are recorded.
- [ ] Current source-of-truth and generated boundaries are cited.
- [ ] Every candidate repository is required, not required, or pending with evidence.
- [ ] Old/new client, server, CLI, config, model, and storage combinations are resolved.
- [ ] Dependency graph names the real publication gate for every edge.
- [ ] Each required repository has a focused branch and linked PR.
- [ ] Downstream manifests use available commits or releases.
- [ ] Generated artifacts are reproducible and free of unexplained churn.
- [ ] Targeted and repository-required validation results are attached.
- [ ] Machine-readable CLI and SDK surfaces have compatibility coverage.
- [ ] Storage backends and migration/rollback paths are covered where relevant.
- [ ] Changelogs, conventional commit titles, release notes, and deprecations follow each repository's process.
- [ ] Human-written docs and generated configuration docs match the correct release state.
- [ ] Temporary dependency workarounds are removed.
- [ ] Blocked work remains visibly blocked; no pending row is reported complete.
