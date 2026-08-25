# OpenFGA Agent Skills

Agent Skills for authoring OpenFGA authorization models and making safe, correct changes to the OpenFGA server.

## Installation

```bash
npx skills add openfga/agent-skills
```

## Available Skills

| Skill | Use it for |
|-------|------------|
| [`openfga`](skills/openfga/SKILL.md) | Authorization model design, tuples, tests, and SDK integration |
| [`openfga-server-development`](skills/openfga-server-development/SKILL.md) | Go server handlers, commands, graph resolution, storage, config, auth, testing, and performance |

The installer discovers both skills from this repository and lets compatible agents activate the relevant one from its description.

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

## When This Skill Activates

The `openfga` modeling skill triggers when working with:

- `.fga` model files
- `.fga.yaml` test files
- OpenFGA relationship definitions
- Permission structures and authorization logic
- OpenFGA SDK code in any supported language

The `openfga-server-development` skill triggers when working in `openfga/openfga` on:

- HTTP/gRPC handlers and commands
- Check, ListObjects, or ListUsers resolution
- Typesystem and tuple validation
- Storage interfaces, backends, pagination, and migrations
- Authentication, API authorization, config, and feature flags
- Concurrency, caching, reliability, benchmarks, and release validation

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
│   └── references/       # Focused modeling and SDK references
└── openfga-server-development/
    ├── SKILL.md          # Server-development workflow and safety gates
    └── references/       # Architecture, correctness, storage, testing, and task workflows
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
6. Changing OpenFGA server handlers, resolvers, storage, configuration, or performance-sensitive code

## Resources

- [OpenFGA Documentation](https://openfga.dev/docs)
- [OpenFGA GitHub](https://github.com/openfga)
- [OpenFGA Playground](https://play.fga.dev)

## License

APACHE 2.0
