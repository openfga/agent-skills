---
name: openfga-cli-development
description: Guides compatible, testable changes to the OpenFGA CLI, including Cobra commands and flags, Viper configuration, authentication and client wiring, JSON/YAML/CSV output contracts, authorization model and store-file handling, tuple and query workflows, pagination, batching, security boundaries, tests, documentation, and release packaging. Use when implementing, reviewing, debugging, or releasing Go code in github.com/openfga/cli, or when changing `fga` command behavior, configuration, schemas, or machine-readable output.
license: Apache-2.0
metadata:
  author: openfga
  version: "1.0.0"
---

# OpenFGA CLI Development

Use this skill for changes to [`openfga/cli`](https://github.com/openfga/cli). Preserve command compatibility, machine-readable output, safe file handling, and the boundary between CLI code, the Go SDK, and the OpenFGA API.

## Non-negotiable invariants

- Treat command names, flags, defaults, exit status, stdout, stderr, and serialized field names as public interfaces.
- Put command-specific flags on `cmd.Flags()`; use persistent flags only when every descendant should inherit them.
- Keep explicit flags above `FGA_*` environment variables, config-file values, and defaults in configuration precedence.
- Send data to stdout and diagnostics, warnings, progress, and summaries to stderr.
- Keep store-file references contained to the store file's directory by default. Never weaken traversal, symlink, or non-regular-file checks to make a fixture pass.
- Reuse the Go SDK client and request types. Do not hand-roll HTTP behavior already owned by the SDK.
- Return wrapped errors from command logic where possible. The root command owns the normal nonzero exit.

## Start with the affected contract

1. Read the parent command, target command, internal helper, and nearest tests.
2. Identify whether the change affects flags/config, API requests, output, external files, pagination/batching, help/docs, or packaging.
3. Record the current behavior with a focused test before changing it when compatibility is at risk.
4. Keep `RunE` thin: parse and validate input, construct dependencies, call testable logic, then render output.
5. Validate the smallest affected packages first, then expand according to the matrix below.

## Load only the needed reference

| Task | Reference |
|------|-----------|
| Cobra structure, flags, Viper precedence, auth, headers, SDK clients, errors | [`references/architecture-and-configuration.md`](references/architecture-and-configuration.md) |
| Models, tuples, queries, pagination, batching, JSON/YAML/CSV compatibility | [`references/commands-and-output.md`](references/commands-and-output.md) |
| Store-file schema, import/export, external references, traversal defenses | [`references/store-files-and-security.md`](references/store-files-and-security.md) |
| Unit/integration strategy, mocks, docs/help, lint, audit, build, release packaging | [`references/testing-and-release.md`](references/testing-and-release.md) |
| New command, shared config, store schema, or output change | [`references/change-workflows.md`](references/change-workflows.md) |

## Validation matrix

Run targeted Go tests during development:

```bash
go test ./cmd/<group> ./internal/<affected-package>
```

Then select the repository targets that match the change:

| Change | Required validation |
|--------|---------------------|
| Pure command/helper logic | targeted `go test`, then `make test-unit` |
| Binary-to-server behavior, auth, request serialization, or exit/output integration | `make test-integration` in addition to unit tests |
| Go source | `make lint`; inspect the diff because this target runs with `--fix` |
| Dependency, request, auth, file-I/O, or security-sensitive change | `make audit` |
| Command tree, flags, help, or packaging | `make build`, `./dist/fga <path> --help`, and a representative smoke command |

`make test-integration` starts an OpenFGA Docker container and requires Docker plus the repository's `commander` test runner.

## Completion checklist

- Existing invocations still parse, including deprecated aliases unless removal is intentional and documented.
- Empty collections serialize consistently (`[]` versus `null` is observable).
- JSON/YAML/CSV field names and types are covered by exact assertions.
- Errors produce a nonzero status without success-shaped stdout.
- Config behavior is tested through flags, `FGA_*`, and YAML when changed.
- External-file behavior has contained, traversal, absolute-path, symlink, and non-regular-file coverage when touched.
- README command/config tables and `docs/STORE_FILE.md` match behavior.
- Parent registration makes the command visible to help, completions, and generated manpages.
- Cross-repository work is requested only when the CLI cannot implement the change against released API/SDK/server contracts.
