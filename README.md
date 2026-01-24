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

| Category | Impact | Description |
|----------|--------|-------------|
| Core Concepts | CRITICAL | Types, relations, tuples, schema basics |
| Relationship Definitions | CRITICAL | Direct, concentric, indirect patterns |
| Testing & Validation | HIGH | `.fga.yaml` structure, assertions, CLI |
| Model Design | HIGH | Permissions, hierarchies, naming |
| Custom Roles | MEDIUM | User-defined and resource-specific roles |
| Optimization | MEDIUM | Simplification, tuple minimization |
| SDK Integration | HIGH | Language-specific client usage |

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
├── SKILL.md          # Quick reference and metadata
├── AGENTS.md         # Comprehensive guide for agents
├── README.md         # This file
└── rules/
    ├── core-*.md     # Core concept rules
    ├── relation-*.md # Relationship pattern rules
    ├── test-*.md     # Testing rules
    ├── design-*.md   # Design pattern rules
    ├── roles-*.md    # Custom role rules
    ├── optimize-*.md # Optimization rules
    ├── workflow-*.md # Workflow rules
    └── sdk-*.md      # SDK-specific rules
```

## Rebuilding AGENTS.md

The `AGENTS.md` file is generated from the individual rule files in `rules/`. To regenerate it after making changes:

```bash
node scripts/build-agents-md.js
```

The script reads:
- Section order and rule order from `skills/openfga/SKILL.md`
- Individual rule content from `skills/openfga/rules/*.md`

When adding new rules:
1. Create the rule file in `rules/` with the appropriate prefix (e.g., `core-`, `relation-`, `test-`)
2. Add the rule to the corresponding section in `SKILL.md` under Quick Reference
3. Run the build script to regenerate `AGENTS.md`

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
