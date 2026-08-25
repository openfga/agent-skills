# OpenFGA Agent Skills

Agent Skills for designing OpenFGA authorization models and making compatible, testable changes to the OpenFGA CLI.

## Installation

```bash
npx skills add openfga/agent-skills
```

## What's Included

| Skill | Use it for |
|-------|------------|
| `openfga` | Authoring, reviewing, and testing OpenFGA authorization models, tuples, permissions, and SDK integrations |
| `openfga-cli-development` | Developing `openfga/cli` commands, flags, configuration, output, store files, tests, and release packaging |

The `openfga` modeling skill provides guidelines and patterns for:

- **Authorization Model Design** - Types, relations, and permission structures
- **Relationship Patterns** - Direct, concentric, indirect, and conditional relationships
- **Testing & Validation** - `.fga.yaml` test files and CLI usage
- **Custom Roles** - User-defined roles and role assignments
- **SDK Integration** - Code examples for JavaScript, Go, Python, Java, and .NET

The `openfga-cli-development` skill provides durable workflows for:

- **Commands & Configuration** - Cobra command structure, flags, Viper precedence, auth, and custom headers
- **Compatibility** - Stable JSON/YAML/CSV output, errors, exit behavior, pagination, and batching
- **Store Files & Security** - Import/export schemas and external-file traversal protections
- **Engineering Workflow** - Unit/integration tests, generated mocks, docs/help synchronization, lint, audit, and packaging

## OpenFGA Modeling Rule Categories

| Category | Description |
|----------|-------------|
| Core | Types, relations, tuples, schema basics |
| Relations | Direct, concentric, indirect, conditional patterns |
| Design | Permissions, hierarchies, naming, modules |
| Roles | Simple static, custom, and resource-specific roles |
| Optimization | Simplification, tuple minimization, type restrictions |
| Testing | `.fga.yaml` structure, assertions, CLI validation |
| SDKs | Language-specific client usage |

## When These Skills Activate

The `openfga` skill triggers when working with:

- `.fga` model files
- `.fga.yaml` test files
- OpenFGA relationship definitions
- Permission structures and authorization logic
- OpenFGA SDK code in any supported language

The `openfga-cli-development` skill triggers when working with:

- Go code in `github.com/openfga/cli`
- `fga` commands, flags, configuration, authentication, or custom headers
- CLI JSON, YAML, simple JSON, or CSV output
- Store import/export, tuple/model/query workflows, pagination, or batching
- CLI tests, fixtures, mocks, help, documentation, linting, audits, or release packaging

## OpenFGA Modeling SDK Support

Includes complete examples for:

- **JavaScript/TypeScript** - `@openfga/sdk`
- **Go** - `github.com/openfga/go-sdk`
- **Python** - `openfga_sdk` (async and sync)
- **Java** - `dev.openfga:openfga-sdk`
- **.NET** - `OpenFga.Sdk`

## File Structure

```
skills/
├── openfga/
│   ├── SKILL.md              # Modeling metadata, rule index, and workflow
│   ├── AGENTS.md             # Generated comprehensive modeling guide
│   └── references/           # Modeling, testing, and SDK rules
└── openfga-cli-development/
    ├── SKILL.md              # CLI development workflow and reference index
    └── references/           # Architecture, compatibility, security, and release guidance
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
6. Adding or changing an `fga` command or flag
7. Updating CLI configuration, output, store files, or API workflows
8. Extending CLI tests, help, documentation, or release packaging

## Resources

- [OpenFGA Documentation](https://openfga.dev/docs)
- [OpenFGA GitHub](https://github.com/openfga)
- [OpenFGA CLI](https://github.com/openfga/cli)
- [OpenFGA Playground](https://play.fga.dev)

## License

APACHE 2.0
