# OpenFGA Agent Skills

Agent Skills for product users who model authorization with OpenFGA or diagnose an OpenFGA deployment or integration.

## Installation

```bash
npx skills add openfga/agent-skills
```

## Available Skills

| Skill | Audience | Use it for |
|-------|----------|------------|
| [`openfga`](skills/openfga/SKILL.md) | **Product user** | Authoring, reviewing, and refactoring authorization models, tuples, tests, and SDK integrations |
| [`openfga-troubleshooting`](skills/openfga-troubleshooting/SKILL.md) | **Product user** | Diagnosing unexpected authorization results, query disagreement, writes, configuration, authentication, connectivity, startup, and performance |

## What's Included in the Modeling Skill

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

## When the Modeling Skill Activates

The `openfga` modeling skill triggers when working with:

- `.fga` model files
- `.fga.yaml` test files
- OpenFGA relationship definitions
- Permission structures and authorization logic
- OpenFGA SDK code in any supported language

The `openfga-troubleshooting` product-user skill triggers when diagnosing:

- Unexpected allows or denies
- Check, ListObjects, or ListUsers disagreement
- Model or tuple write errors
- Wrong store, model, endpoint, authentication, or SDK/CLI configuration
- Server startup, migration, timeout, throttling, or latency problems

## SDK Support

Includes complete examples for:

- **JavaScript/TypeScript** - `@openfga/sdk`
- **Go** - `github.com/openfga/go-sdk`
- **Python** - `openfga_sdk` (async and sync)
- **Java** - `dev.openfga:openfga-sdk`
- **.NET** - `OpenFga.Sdk`

## File Structure

```text
skills/
├── openfga/
│   ├── SKILL.md          # Modeling metadata, rule index, and workflow
│   ├── AGENTS.md         # Generated comprehensive modeling guide
│   └── references/       # Modeling, testing, and SDK references
└── openfga-troubleshooting/
    ├── SKILL.md          # Product-user diagnostic workflow
    └── references/       # Symptom trees, reproduction, and escalation guidance
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
6. Diagnosing OpenFGA deployment or integration symptoms without exposing production data

## Resources

- [OpenFGA Documentation](https://openfga.dev/docs)
- [OpenFGA GitHub](https://github.com/openfga)
- [OpenFGA Playground](https://play.fga.dev)

## License

APACHE 2.0
