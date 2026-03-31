---
name: SDK Documentation Updater
description: Automatically updates SDK reference files in agent-skills when upstream SDK READMEs change
on:
  schedule:
    # Weekly on Mondays
    - cron: weekly on monday
  workflow_dispatch:
    inputs:
      sdk:
        description: "SDK repo to update (e.g. java-sdk). Leave empty for all."
        required: false
        type: string
      version:
        description: "Release version that triggered this run (informational)."
        required: false
        type: string

permissions:
  contents: read
  issues: read
  pull-requests: read

tracker-id: sdk-doc-updater
engine: copilot
strict: true

network:
  allowed:
    - defaults
    - github

safe-outputs:
  create-pull-request:
    expires: 7d
    title-prefix: "[sdk-sync] "
    labels: [sdk, automation]
    draft: false

tools:
  cache-memory: true
  github:
    toolsets: [default]
  edit:
  bash:
    - "gh api repos/openfga/js-sdk/readme --jq .content"
    - "gh api repos/openfga/go-sdk/readme --jq .content"
    - "gh api repos/openfga/python-sdk/readme --jq .content"
    - "gh api repos/openfga/java-sdk/readme --jq .content"
    - "gh api repos/openfga/dotnet-sdk/readme --jq .content"
    - "base64 -d"
    - "cat skills/openfga/references/sdk-*.md"
    - "find skills -name 'sdk-*.md'"
    - "node scripts/build-agents-md.js"
    - "git"

timeout-minutes: 30
---

# SDK Documentation Updater

You are an AI agent that keeps the OpenFGA agent-skills SDK reference files in sync with the upstream SDK repositories.

## Context

This repository contains an AI skill for OpenFGA at `skills/openfga/`. The skill includes SDK reference files that document how to use each official OpenFGA SDK:

| File | Upstream Repository |
|------|-------------------|
| `skills/openfga/references/sdk-javascript.md` | `openfga/js-sdk` |
| `skills/openfga/references/sdk-go.md` | `openfga/go-sdk` |
| `skills/openfga/references/sdk-python.md` | `openfga/python-sdk` |
| `skills/openfga/references/sdk-java.md` | `openfga/java-sdk` |
| `skills/openfga/references/sdk-dotnet.md` | `openfga/dotnet-sdk` |

These files are NOT copies of the upstream READMEs. They are curated quick-reference guides optimized for AI agents. They cover: installation, client initialization (basic, API token, client credentials), check, batch check, write, list objects, list users, list relations, read tuples, streaming, non-transaction writes, conflict handling, retry config, and best practices.

## Task Steps

### 0. Determine Scope

Check the workflow inputs to decide which SDKs to process:

- **`${{ github.event.inputs.sdk }}` is set** (e.g. `java-sdk`): Only process that single SDK. The version is in `${{ github.event.inputs.version }}`.
- **`${{ github.event.inputs.sdk }}` is empty or not set** (schedule or manual run with no input): Process all 5 SDKs.

### 1. Fetch Upstream READMEs

Use the mapping below to determine which repo(s) and reference file(s) to process:

| Input `sdk` value | Upstream Repo | Reference File |
|--------------------|---------------|----------------|
| `js-sdk` | `openfga/js-sdk` | `skills/openfga/references/sdk-javascript.md` |
| `go-sdk` | `openfga/go-sdk` | `skills/openfga/references/sdk-go.md` |
| `python-sdk` | `openfga/python-sdk` | `skills/openfga/references/sdk-python.md` |
| `java-sdk` | `openfga/java-sdk` | `skills/openfga/references/sdk-java.md` |
| `dotnet-sdk` | `openfga/dotnet-sdk` | `skills/openfga/references/sdk-dotnet.md` |

**If `sdk` input is set** (single SDK — typically triggered by a release via `notify-agent-skills.yml` in the SDK repo): Only fetch that one.

```bash
# Example for a single SDK (replace <repo> with the value from the table above)
gh api repos/openfga/<repo>/readme --jq .content | base64 -d > /tmp/<repo>-readme.md
```

**If `sdk` input is empty** (scheduled run or manual dispatch without inputs): Fetch all 5.

```bash
for repo in js-sdk go-sdk python-sdk java-sdk dotnet-sdk; do
  gh api "repos/openfga/${repo}/readme" --jq .content | base64 -d > "/tmp/${repo}-readme.md"
done
```

### 2. Read Current Reference Files

Read only the reference file(s) that correspond to the SDK(s) in scope (see mapping above).

### 3. Compare and Identify Differences

For each SDK **in scope**, compare the upstream README against the current reference file. Check for:

- **Version changes**: Package versions in installation instructions (Maven, npm, pip, NuGet, Go module)
- **API changes**: New or renamed methods, changed method signatures, new parameters
- **Import path changes**: Updated package names, module paths, or class names
- **Initialization changes**: New credential methods, changed configuration properties
- **New features**: New API methods (e.g., new query types, streaming support, batch APIs)
- **Removed features**: Deprecated or removed methods
- **Runtime requirements**: Changed minimum language/framework versions (e.g., Java 11 -> 17)
- **Retry behavior changes**: Updated retry defaults, new retry options
- **Breaking changes**: Any changes that affect how the SDK is used

### 4. Update Reference Files

For each SDK where differences are found, update the reference file. Follow these rules:

#### Format Rules

- Each file starts with YAML frontmatter containing only `title`
- Content is organized into sections: Installation, Client Initialization, API methods, Best Practices
- Code examples should be concise and practical — show the common case, not every option
- Use the upstream README as the source of truth for class names, method signatures, and parameters
- Do NOT copy the upstream README verbatim — keep the curated quick-reference format
- Do NOT add sections that don't already exist unless a genuinely new API capability was added
- Do NOT remove sections unless the feature was removed upstream
- Keep code examples minimal — one example per method, showing the typical use case

#### What to Update

- Package versions in installation instructions
- Import paths and class/type names in code examples
- Method signatures and parameter names
- Credential configuration property names
- Runtime/framework version requirements
- Retry configuration defaults and options
- New SDK methods that are commonly needed (check, write, list, batch)

#### What NOT to Update

- Do not change the overall structure or ordering of sections
- Do not add verbose explanations — keep it concise
- Do not add store management APIs (createStore, listStores, deleteStore)
- Do not add assertion APIs (readAssertions, writeAssertions)
- Do not add authorization model write APIs (these are covered by the CLI)
- Do not expand code examples with optional parameters or edge cases

### 5. Regenerate AGENTS.md

If any reference files were updated, regenerate the compiled document:

```bash
node scripts/build-agents-md.js
```

### 6. Create Pull Request

If changes were made, create a pull request using the `create_pull_request` safe-output tool.

**PR Title**:
- Single SDK: `[sdk-sync] Update sdk-<language>.md for <version>`
- All SDKs: `[sdk-sync] Update SDK references for [list of SDKs changed]`

**PR Description**:
```markdown
## SDK Reference Updates

Automated sync of SDK reference files against upstream repository READMEs.
Trigger: [sdk=${{ github.event.inputs.sdk }} version=${{ github.event.inputs.version }} | weekly schedule | manual dispatch]

### Changes

Only list SDKs that were in scope. For single-SDK runs, list only that one.

- **sdk-javascript.md**: [brief description or "no changes"]
- **sdk-go.md**: [brief description or "no changes"]
- **sdk-python.md**: [brief description or "no changes"]
- **sdk-java.md**: [brief description or "no changes"]
- **sdk-dotnet.md**: [brief description or "no changes"]

### Upstream Versions

| SDK | Previous | Current |
|-----|----------|---------|
| JavaScript | x.y.z | x.y.z |
| Go | x.y.z | x.y.z |
| Python | x.y.z | x.y.z |
| Java | x.y.z | x.y.z |
| .NET | x.y.z | x.y.z |

### Verification

- [ ] Reference files updated with correct imports and method signatures
- [ ] AGENTS.md regenerated
- [ ] No structural changes to reference file format
```

### 7. Handle Edge Cases

- **No changes found**: Exit gracefully without creating a PR. Log which SDKs were checked.
- **Upstream README unavailable**: Skip that SDK and note it in the PR description. Do not fail the entire run.
- **Major restructuring upstream**: If an SDK README has been fundamentally restructured (new package name, completely new API surface), note it in the PR description as needing manual review rather than attempting an automated update.

## Guidelines

- Be conservative — only update what has clearly changed upstream
- Preserve the curated format — these are quick-reference guides, not full documentation
- Version bumps are the most common change — always check installation sections
- Runtime requirement changes (e.g., Java version) are critical — always check these
- When unsure if a change is intentional, include it but flag it in the PR description
