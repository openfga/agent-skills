---
title: Repository Dependency Map
---

# Repository Dependency Map

Verify these paths on current `main` before acting. They document the observed ownership and dependency flow; they are not a promise that every change touches every repository.

## Ecosystem map

| Repository | Owns | Consumes or derives from | Typical consumers |
|------------|------|-------------------------|-------------------|
| [`openfga/api`](https://github.com/openfga/api) | Stable and experimental protobuf definitions; generated Go protobuf/gRPC code; OpenAPI document | Buf dependencies declared in `buf.yaml` | `openfga/openfga`, `openfga/cli`, `openfga/sdk-generator`, Buf Schema Registry consumers |
| [`openfga/language`](https://github.com/openfga/language) | OpenFGA DSL grammar and generated language packages | API types where declared | `openfga/openfga`, `openfga/cli`, other language-package consumers |
| [`openfga/openfga`](https://github.com/openfga/openfga) | Server behavior, configuration schema, storage implementations | `github.com/openfga/api/proto`, `github.com/openfga/language/pkg/go` | Deployments and `openfga/cli` embedded-server workflows |
| [`openfga/sdk-generator`](https://github.com/openfga/sdk-generator) | Shared and client-specific OpenAPI Generator configuration and templates | `openfga/api` OpenAPI document | Official generated HTTP SDK repositories |
| Official SDK repositories | Released client packages plus any repository-owned non-generated code | Generated output from `openfga/sdk-generator` | Applications; the Go SDK is also consumed by `openfga/cli` |
| [`openfga/cli`](https://github.com/openfga/cli) | `fga` commands, arguments, output, local workflows | API proto module, Go SDK, server module, language module | CLI users and scripts |
| [`openfga/openfga.dev`](https://github.com/openfga/openfga.dev) | Human-written product documentation and examples; generated server configuration page | Released server configuration schema for the generated page | OpenFGA users and operators |

## `openfga/api`

Canonical definitions live under:

- [`openfga/v1/`](https://github.com/openfga/api/tree/main/openfga/v1) for the OpenFGA API
- [`authzen/v1/`](https://github.com/openfga/api/tree/main/authzen/v1) for the experimental AuthZEN API

Generation is configured by [`buf.gen.yaml`](https://github.com/openfga/api/blob/main/buf.gen.yaml) and orchestrated by the [`Makefile`](https://github.com/openfga/api/blob/main/Makefile).

Generated boundaries:

- `proto/**/*.go`: generated Go protobuf, gRPC, validation, and gateway code
- `docs/openapiv2/apidocs.swagger.json`: generated OpenAPI v2 document
- `proto/go.mod`: the independently consumed `github.com/openfga/api/proto` module

Current review CI runs Buf lint, breaking-change and formatting checks, regenerates outputs, rejects generated drift, and validates the OpenAPI document. A merge to `main` publishes the Buf module when the configured proto paths change. Inspect:

- [review workflow](https://github.com/openfga/api/blob/main/.github/workflows/review.yaml)
- [push workflow](https://github.com/openfga/api/blob/main/.github/workflows/push.yaml)
- [Buf module configuration](https://github.com/openfga/api/blob/main/buf.yaml)

Downstream Go repositories currently consume API commits through Go pseudo-versions. Record the merged commit and resolved pseudo-version; do not hardcode an example version from this reference.

## `openfga/language`

The root ANTLR grammar files, including `OpenFGALexer.g4` and `OpenFGAParser.g4`, own OpenFGA DSL syntax. The repository publishes language packages; `openfga/openfga` and `openfga/cli` consume `github.com/openfga/language/pkg/go`.

Start here when syntax, parsing, transformation, or language validation changes. A server-only evaluation change may instead start in `openfga/openfga`; prove ownership from code and tests.

## `openfga/openfga`

The server consumes API and language modules in [`go.mod`](https://github.com/openfga/openfga/blob/main/go.mod). Public API implementation, evaluation behavior, configuration, and storage live here after their upstream contract or grammar is available.

Important boundaries:

- `.config-schema.json`: schema used to describe server configuration keys, environment variables, flags, types, descriptions, and defaults
- storage packages and tests: persistence behavior and backend-specific compatibility
- `CHANGELOG.md`: hand-maintained release note source, enforced for applicable PRs

Inspect the current [`Makefile`](https://github.com/openfga/openfga/blob/main/Makefile), [release policy](https://github.com/openfga/openfga/blob/main/RELEASES.md), and [changelog enforcement](https://github.com/openfga/openfga/blob/main/.github/workflows/enforce-changelog-entry.yaml).

## `openfga/sdk-generator` and official SDKs

The generator takes the API repository's `docs/openapiv2/apidocs.swagger.json` and applies:

- `config/common/config.base.json`
- `config/clients/<language>/config.overrides.json`
- `config/clients/<language>/generator.txt`
- `config/clients/<language>/template/`

See the current [generator README](https://github.com/openfga/sdk-generator/blob/main/README.md) and [client configurations](https://github.com/openfga/sdk-generator/tree/main/config/clients).

The currently documented supported SDKs are:

- [`openfga/js-sdk`](https://github.com/openfga/js-sdk)
- [`openfga/go-sdk`](https://github.com/openfga/go-sdk)
- [`openfga/dotnet-sdk`](https://github.com/openfga/dotnet-sdk)
- [`openfga/python-sdk`](https://github.com/openfga/python-sdk)
- [`openfga/java-sdk`](https://github.com/openfga/java-sdk)

The generator may contain additional client configuration directories. Treat directory presence as a discovery signal, not proof of official support; verify the generator README and target repository status.

For generated surfaces, change generator configuration or templates and regenerate. Inspect generated notices before editing: some target repositories also contain repository-owned hand-written code that may require a separate source change.

No API-to-SDK cross-repository regeneration trigger is assumed. Follow the current generator instructions, create explicit PRs, and record the API specification commit used.

## `openfga/cli`

The CLI's [`go.mod`](https://github.com/openfga/cli/blob/main/go.mod) currently shows distinct dependencies on:

- `github.com/openfga/api/proto`
- `github.com/openfga/go-sdk`
- `github.com/openfga/language/pkg/go`
- `github.com/openfga/openfga`

Inspect [`cmd/`](https://github.com/openfga/cli/tree/main/cmd) and `internal/` to identify commands, request construction, embedded-server behavior, and output formatting. Determine which dependency edge applies; do not bump all four automatically.

The CLI uses conventional commit titles and release-please. Its release notes are derived from commit history according to [`release-please-config.json`](https://github.com/openfga/cli/blob/main/release-please-config.json).

## `openfga/openfga.dev`

Most content under [`docs/content/`](https://github.com/openfga/openfga.dev/tree/main/docs/content) is human-written.

The server configuration page is different:

- `scripts/update-config-page.mjs` reads `.config-schema.json` from the latest released `openfga/openfga` tag
- `.github/workflows/update-docs.yml` runs on a schedule or manual dispatch and opens an update PR only when content changes

Therefore, config documentation follows a server release, not an unreleased server `main` commit. Update surrounding explanations or examples manually when needed, but do not hand-edit generated configuration tables. Inspect:

- [configuration generator](https://github.com/openfga/openfga.dev/blob/main/scripts/update-config-page.mjs)
- [configuration update workflow](https://github.com/openfga/openfga.dev/blob/main/.github/workflows/update-docs.yml)
- [documentation checks](https://github.com/openfga/openfga.dev/blob/main/.github/workflows/checks.yaml)

Treat API reference hosting as a separate discovery question. Confirm its current source and deployment path in the docs repository before claiming that an API merge updates the public site automatically.
