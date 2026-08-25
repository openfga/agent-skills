# OpenFGA Agent Skills

Agent Skills for OpenFGA authorization modeling and ecosystem-wide change delivery.

## Installation

```bash
npx skills add openfga/agent-skills
```

## What's Included

| Skill | Use it for |
|-------|------------|
| [`openfga`](skills/openfga/SKILL.md) | Authoring, reviewing, testing, and refactoring OpenFGA authorization models |
| [`openfga-cross-repo-change`](skills/openfga-cross-repo-change/SKILL.md) | Scoping and delivering API, server, CLI, SDK, language, storage, configuration, documentation, deprecation, and release changes across OpenFGA repositories |

The modeling skill provides guidelines and patterns for:

- **Authorization Model Design** - Types, relations, and permission structures
- **Relationship Patterns** - Direct, concentric, indirect, and conditional relationships
- **Testing & Validation** - `.fga.yaml` test files and CLI usage
- **Custom Roles** - User-defined roles and role assignments
- **SDK Integration** - Code examples for JavaScript, Go, Python, Java, and .NET

The cross-repository change skill provides:

- **Evidence-Based Impact Analysis** - Include or exclude repositories from real dependency and generated-artifact evidence
- **Source-to-Consumer Mapping** - Trace API, language, server, SDK, CLI, and documentation ownership
- **Compatibility & Rollout Planning** - Cover mixed versions, migrations, deprecations, and dependency ordering
- **Delivery Evidence** - Track linked PRs, available versions, repository-specific validation, changelogs, and completion

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

The skill triggers when working with:

- `.fga` model files
- `.fga.yaml` test files
- OpenFGA relationship definitions
- Permission structures and authorization logic
- OpenFGA SDK code in any supported language

## When the Cross-Repository Skill Activates

The cross-repository skill triggers when planning, implementing, reviewing, or releasing changes involving:

- OpenFGA protobuf, REST API, endpoints, messages, or fields
- Authorization language syntax or model semantics
- Server configuration, storage, or compatibility behavior
- CLI commands, schemas, exit behavior, or output
- SDK generation, templates, package releases, or version bumps
- Documentation, deprecation, rollout sequencing, or linked cross-repository PRs

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
│   ├── SKILL.md              # Modeling skill metadata, rule index, and workflow
│   ├── AGENTS.md             # Generated comprehensive modeling guide
│   └── references/           # Focused modeling and SDK rules
└── openfga-cross-repo-change/
    ├── SKILL.md              # Cross-repository impact and delivery workflow
    └── references/           # Dependency map, compatibility, delivery, and template
```

## Rebuilding the Modeling AGENTS.md

The modeling skill's `AGENTS.md` file is generated from its individual reference files. To regenerate it after making changes:

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
6. Planning an API change from `openfga/api` through server, SDK, CLI, and docs consumers
7. Determining whether a config, storage, language, CLI, or release change needs cross-repository work

## Resources

- [OpenFGA Documentation](https://openfga.dev/docs)
- [OpenFGA GitHub](https://github.com/openfga)
- [OpenFGA Playground](https://play.fga.dev)

## License

APACHE 2.0
