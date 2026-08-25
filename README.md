# OpenFGA Agent Skills

Agent Skills for building with OpenFGA and contributing high-quality OpenFGA documentation.

## Installation

```bash
npx skills add openfga/agent-skills
```

## What's Included

| Skill | Use it for |
|-------|------------|
| [`openfga`](skills/openfga/SKILL.md) | Authoring, reviewing, testing, and integrating OpenFGA authorization models |
| [`openfga-docs`](skills/openfga-docs/SKILL.md) | Editing and validating the Docusaurus, MDX, React, TypeScript, API reference, and agent-readable documentation in `openfga/openfga.dev` |

## OpenFGA Modeling Skill

The `openfga` skill provides guidelines and patterns for:

- **Authorization Model Design** - Types, relations, and permission structures
- **Relationship Patterns** - Direct, concentric, indirect, and conditional relationships
- **Testing & Validation** - `.fga.yaml` test files and CLI usage
- **Custom Roles** - User-defined roles and role assignments
- **SDK Integration** - Code examples for JavaScript, Go, Python, Java, and .NET

### Rule Categories

| Category | Description |
|----------|-------------|
| Core | Types, relations, tuples, schema basics |
| Relations | Direct, concentric, indirect, conditional patterns |
| Design | Permissions, hierarchies, naming, modules |
| Roles | Simple static, custom, and resource-specific roles |
| Optimization | Simplification, tuple minimization, type restrictions |
| Testing | `.fga.yaml` structure, assertions, CLI validation |
| SDKs | Language-specific client usage |

### When This Skill Activates

The skill triggers when working with:

- `.fga` model files
- `.fga.yaml` test files
- OpenFGA relationship definitions
- Permission structures and authorization logic
- OpenFGA SDK code in any supported language

### SDK Support

Includes complete examples for:

- **JavaScript/TypeScript** - `@openfga/sdk`
- **Go** - `github.com/openfga/go-sdk`
- **Python** - `openfga_sdk` (async and sync)
- **Java** - `dev.openfga:openfga-sdk`
- **.NET** - `OpenFga.Sdk`

## OpenFGA Documentation Skill

The `openfga-docs` skill guides agents through:

- Docusaurus 3 content, sidebars, navigation, redirects, anchors, and Swagger touchpoints
- Diataxis-informed page intent and precise OpenFGA terminology
- Runnable model, tuple, API, and CLI examples
- Generated configuration documentation and source-of-truth boundaries
- `/llms.txt`, `/docs/llms.txt`, `/llms-full.txt`, adjacent Markdown pages, and build validation
- Accessible, responsive MDX and React/TypeScript documentation UI
- Exact repository checks, local previews, PR previews, and link-check expectations

It activates for documentation work in `openfga/openfga.dev`, including changes under `docs/content`, `src/components/Docs`, `docs/sidebars.js`, and `docusaurus.config.js`.

## Repository Structure

```
skills/
├── openfga/
│   ├── SKILL.md          # Modeling skill metadata, index, and workflow
│   ├── AGENTS.md         # Generated comprehensive modeling guide
│   └── references/       # Modeling, testing, and SDK rules
└── openfga-docs/
    ├── SKILL.md          # Documentation skill workflow and reference index
    └── references/       # Authoring, generation, UI, API, and validation guidance
```

## Rebuilding the Modeling AGENTS.md

The modeling skill's `AGENTS.md` file is generated from its individual reference files. To regenerate it after changing `skills/openfga`:

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

Once installed, AI agents can apply the appropriate skill when:

1. Creating new OpenFGA models
2. Reviewing existing authorization code
3. Writing relationship tuples
4. Implementing permission checks in application code
5. Setting up model tests
6. Authoring or reviewing pages in `openfga/openfga.dev`
7. Updating documentation navigation, components, API references, or agent-readable output

## Resources

- [OpenFGA Documentation](https://openfga.dev/docs)
- [OpenFGA GitHub](https://github.com/openfga)
- [OpenFGA Playground](https://play.fga.dev)

## License

APACHE 2.0
