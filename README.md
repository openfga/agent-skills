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
- **Docs & API Reference** - Looking up current docs via `llms.txt`, calling the HTTP API, and validating payloads against the OpenAPI spec

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
| Docs & API Reference | `llms.txt` lookups, HTTP API request shapes, OpenAPI payload validation |

## When This Skill Activates

The skill triggers when working with:

- `.fga` model files
- `.fga.yaml` test files
- OpenFGA relationship definitions
- Permission structures and authorization logic
- OpenFGA SDK code in any supported language
- Direct calls to the OpenFGA HTTP API

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
    ├── sdk-*.md          # SDK-specific references
    └── docs-*.md         # Docs, HTTP API, and OpenAPI references
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

## Example Usage

Once installed, AI agents will automatically apply these best practices when:

1. Creating new OpenFGA models
2. Reviewing existing authorization code
3. Writing relationship tuples
4. Implementing permission checks in application code
5. Setting up model tests
6. Calling the OpenFGA HTTP API or looking up current OpenFGA docs

## Resources

- [OpenFGA Documentation](https://openfga.dev/docs)
- [OpenFGA Docs for LLMs (llms.txt)](https://openfga.dev/docs/llms.txt) and [llms-full.txt](https://openfga.dev/docs/llms-full.txt)
- [OpenFGA HTTP API Reference](https://openfga.dev/docs/api/service)
- [OpenFGA OpenAPI Spec](https://github.com/openfga/api/blob/main/docs/openapiv3/apidocs.openapi.json)
- [OpenFGA GitHub](https://github.com/openfga)
- [OpenFGA Playground](https://play.fga.dev)

## License

APACHE 2.0
