# OpenFGA Agent Skills

Agent Skills for using and operating OpenFGA.

## Installation

```bash
npx skills add openfga/agent-skills
```

## Skill Discovery

| Skill | Audience | Focus |
|---|---|---|
| `openfga` | **Product-user**: model authors and application developers | Authorization models, tuples, tests, and SDK integration |
| `openfga-production-operations` | **Product-user**: platform engineers, operators, and SREs | Production deployment, datastore lifecycle, security, telemetry, tuning, upgrades, and incidents |

These are product-user skills. They do not provide guidance for contributing to the `openfga/openfga` server.

## What's Included

### Authorization Modeling

The `openfga` skill provides guidelines and patterns for:

- **Authorization Model Design** - Types, relations, and permission structures
- **Relationship Patterns** - Direct, concentric, indirect, and conditional relationships
- **Testing & Validation** - `.fga.yaml` test files and CLI usage
- **Custom Roles** - User-defined roles and role assignments
- **SDK Integration** - Code examples for JavaScript, Go, Python, Java, and .NET

### Production Operations

The `openfga-production-operations` skill covers:

- **Architecture & Capacity** - Workload questions, scaling, resources, and graceful shutdown
- **Datastore Lifecycle** - Support boundaries, migrations, pools, backup/restore, and upgrades
- **Security & Networking** - Authentication, TLS, secrets, proxies, and exposure
- **Observability & Incidents** - Logs, metrics, traces, health checks, evidence, and redaction
- **Performance & Limits** - Caches, throttles, deadlines, query limits, and tuning
- **Deployment & Validation** - Docker, Compose, Kubernetes, Helm, and smoke tests

## Modeling Rule Categories

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

The modeling skill triggers when working with:

- `.fga` model files
- `.fga.yaml` test files
- OpenFGA relationship definitions
- Permission structures and authorization logic
- OpenFGA SDK code in any supported language

The production-operations skill triggers when working with:

- OpenFGA server, datastore, migration, or upgrade plans
- Docker, Compose, Kubernetes, or Helm deployments
- OpenFGA authentication, TLS, secrets, and network exposure
- Metrics, traces, logs, health checks, and runtime incidents
- OpenFGA performance, caching, throttling, deadlines, or connection pools

## SDK Support

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
│   ├── AGENTS.md             # Generated modeling guide
│   └── references/           # Focused modeling and SDK references
└── openfga-production-operations/
    ├── SKILL.md              # Production lifecycle and reference index
    └── references/           # Focused operational runbooks and source map
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

Once installed, AI agents will automatically apply the relevant skill when:

1. Creating new OpenFGA models
2. Reviewing existing authorization code
3. Writing relationship tuples
4. Implementing permission checks in application code
5. Setting up model tests
6. Planning or reviewing an OpenFGA production deployment
7. Operating, tuning, upgrading, or troubleshooting OpenFGA

## Resources

- [OpenFGA Documentation](https://openfga.dev/docs)
- [OpenFGA GitHub](https://github.com/openfga)
- [OpenFGA Playground](https://play.fga.dev)

## License

APACHE 2.0
