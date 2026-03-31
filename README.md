# OpenFGA Best Practices Skill

A comprehensive skill for AI agents to author, review, and refactor OpenFGA authorization models following best practices.

## Installation

```bash
npx skills add openfga/agent-skills
```

## What's Included

This skill provides guidelines and patterns for:

- **Authorization Model Design** - Types, relations, and permission structures
- **Relationship Patterns** - Direct, concentric, indirect, and conditional relationships
- **Testing & Validation** - `.fga.yaml` test files and CLI usage
- **Custom Roles** - User-defined roles and role assignments
- **SDK Integration** - Code examples for JavaScript, Go, Python, Java, and .NET

## Rule Categories

| Category | Description |
|----------|-------------|
| Core | Types, relations, tuples, schema basics |
| Relations | Direct, concentric, indirect, conditional patterns |
| Design | Permissions, hierarchies, naming, modules |
| Roles | Simple static, custom, and resource-specific roles |
| Optimization | Simplification, tuple minimization, type restrictions |
| Testing | `.fga.yaml` structure, assertions, CLI validation |
| SDKs | Language-specific client usage |

## When This Skill Activates

The skill triggers when working with:

- `.fga` model files
- `.fga.yaml` test files
- OpenFGA relationship definitions
- Permission structures and authorization logic
- OpenFGA SDK code in any supported language

## SDK Support

Includes complete examples for:

- **JavaScript/TypeScript** - `@openfga/sdk`
- **Go** - `github.com/openfga/go-sdk`
- **Python** - `openfga_sdk` (async and sync)
- **Java** - `dev.openfga:openfga-sdk`
- **.NET** - `OpenFga.Sdk`

## File Structure

```
openfga/
├── SKILL.md              # Skill metadata, rule index, and workflow
├── AGENTS.md             # Generated comprehensive guide (all rules expanded)
└── references/
    ├── core-*.md         # Core concept references
    ├── relation-*.md     # Relationship pattern references
    ├── design-*.md       # Design pattern references
    ├── roles-*.md        # Custom role references
    ├── optimize-*.md     # Optimization references
    ├── test-*.md         # Testing references
    ├── workflow-*.md     # Workflow references
    └── sdk-*.md          # SDK-specific references
```

## Rebuilding AGENTS.md

The `AGENTS.md` file is generated from the individual reference files. To regenerate it after making changes:

```bash
node scripts/build-agents-md.js
```

The script reads:
- Section order and rule order from the Rule Index tables in `skills/openfga/SKILL.md`
- Individual rule content from `skills/openfga/references/*.md`

When adding new rules:
1. Create the rule file in `references/` with the appropriate prefix (e.g., `core-`, `relation-`, `test-`)
2. Add the rule to the corresponding table in the Rule Index section of `SKILL.md`
3. Run the build script to regenerate `AGENTS.md`

## Automated SDK Sync

SDK reference files (`references/sdk-*.md`) are kept in sync with upstream SDK repositories via a [GitHub Agentic Workflow](https://github.com/github/gh-aw).

### How it works

1. When an SDK repo publishes a release, it triggers the `sdk-doc-updater` workflow in this repo
2. The workflow fetches the upstream README, compares it against the curated reference file, and updates only what changed (versions, imports, method signatures, runtime requirements)
3. It regenerates `AGENTS.md` and opens a PR

### Trigger flow

```
openfga/java-sdk release published
  → .github/workflows/workflow-templates/notify-agent-skills.yml (in SDK repo)
    → gh workflow run "SDK Documentation Updater" (in this repo, with sdk=java-sdk)
      → compares upstream README vs references/sdk-java.md
        → opens PR if changes found
```

### Workflows

| File | Location | Purpose |
|------|----------|---------|
| `sdk-doc-updater.md` | This repo | Agentic workflow that fetches, compares, and updates SDK reference files |
| `notify-agent-skills.yml` | Each SDK repo | Triggers `sdk-doc-updater` on release via `workflow_dispatch` |

### Schedule

- **On SDK release**: Only the released SDK is processed
- **Weekly (Monday)**: All 5 SDKs are checked as a catch-all
- **Manual**: Run from the Actions tab with optional `sdk` and `version` inputs

### Setup for a new SDK repo

1. Add `.github/workflows/notify-agent-skills.yml` to the SDK repo (template is in this repo)
2. Create an `AGENT_SKILLS_PAT` secret in the SDK repo with `actions:write` on `openfga/agent-skills`
3. Add the SDK to the mapping table in `sdk-doc-updater.md` and the Rule Index in `SKILL.md`
4. Create the reference file at `skills/openfga/references/sdk-<language>.md`

## Example Usage

Once installed, AI agents will automatically apply these best practices when:

1. Creating new OpenFGA models
2. Reviewing existing authorization code
3. Writing relationship tuples
4. Implementing permission checks in application code
5. Setting up model tests

## Resources

- [OpenFGA Documentation](https://openfga.dev/docs)
- [OpenFGA GitHub](https://github.com/openfga)
- [OpenFGA Playground](https://play.fga.dev)

## License

APACHE 2.0
