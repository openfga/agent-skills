# Testing, documentation, and release

## Unit tests

Keep command logic callable without Cobra process setup. Existing tests use GoMock SDK interfaces from [`internal/mocks/client.go`](https://github.com/openfga/cli/blob/main/internal/mocks/client.go) and assert:

- exact request bodies and options;
- continuation-token and pagination sequences;
- error wrapping and validation;
- serialized JSON or exact CSV text;
- store-file conversion and security behavior.

Use table-driven tests and `t.TempDir()` fixtures for file behavior. Exact output assertions are appropriate for stable machine contracts; structural assertions are better when order is intentionally unspecified. Make empty slices explicit when the contract requires `[]` instead of `null`.

Run focused packages first, for example:

```bash
go test ./cmd/tuple ./internal/tuple ./internal/output
go test ./cmd/store ./internal/storetest ./internal/safefile
```

`make test-unit` runs all packages with the race detector, atomic coverage, no cache, and a five-minute timeout.

### Fixtures and golden output

There is no repository-wide golden-file framework. Unit tests keep exact expected JSON and CSV strings inline, tuple parser fixtures live under `cmd/tuple/testdata`, and binary/server fixtures live under `tests/fixtures`. Commander YAML cases assert exit codes and selected JSON paths or stderr text.

For changed output, pair a focused unit serialization assertion with a commander case. Add a checked-in golden file only when the complete output is too large to review inline; keep updates explicit rather than hiding them behind an automatic rewrite flag.

## Generated mocks

The mock file is generated and must not be edited manually. [`make generate-mocks`](https://github.com/openfga/cli/blob/main/Makefile) installs `mockgen`, clones `openfga/go-sdk` into `mocks/`, and writes `internal/mocks/client.go`.

Regenerate only when the consumed SDK interface changes. Ensure the source SDK revision matches the CLI dependency intent, inspect the generated diff, and do not commit the temporary `mocks/` clone. Existing mocks may already cover a new command.

## Integration tests

[`make test-integration`](https://github.com/openfga/cli/blob/main/Makefile) builds and installs a coverage-enabled `fga`, starts an OpenFGA Docker container, and runs `commander test --dir ./tests` through [`tests/scripts/run-test-suites.sh`](https://github.com/openfga/cli/blob/main/tests/scripts/run-test-suites.sh).

Commander YAML cases assert the binary's exit code and selected stdout/stderr content. Add or update a case when behavior crosses Cobra parsing, Viper/env binding, binary output, auth/request serialization, or the server boundary. Keep fixtures under `tests/fixtures`, make setup dependencies explicit, and assert stable JSON paths rather than terminal decoration.

Run integration tests for:

- new server-backed commands;
- changed flags/config reaching API requests;
- changed machine-readable output or exit status;
- import/export and tuple pipelines;
- store-file traversal/trust-boundary behavior.

## Help and documentation

Command metadata (`Use`, `Short`, `Long`, `Example`, `Args`, flags, deprecations) is the source for `--help`, completions, and manpages. Update it with the implementation.

Also synchronize:

- command/config/output examples in [`README.md`](https://github.com/openfga/cli/blob/main/README.md);
- store schema and trust behavior in [`docs/STORE_FILE.md`](https://github.com/openfga/cli/blob/main/docs/STORE_FILE.md);
- fixtures and commander cases that demonstrate public usage.

[`scripts/completions.sh`](https://github.com/openfga/cli/blob/main/scripts/completions.sh) and [`scripts/manpages.sh`](https://github.com/openfga/cli/blob/main/scripts/manpages.sh) generate release artifacts from the registered Cobra tree. The generated directories are release-time artifacts, not the primary source to hand-edit.

Smoke-check command-tree changes:

```bash
make build
./dist/fga --help
./dist/fga <group> <command> --help
NO_COLOR=1 ./dist/fga version
```

## Lint and audit

[`make lint`](https://github.com/openfga/cli/blob/main/Makefile) runs golangci-lint with `--fix`. [`.golangci.yaml`](https://github.com/openfga/cli/blob/main/.golangci.yaml) enables all linters except its explicit exclusions, enforces snake-case JSON tags, limits function length, applies a production/test import allowlist through `depguard`, and runs `gofmt`, `gofumpt`, and `goimports` with the local module prefix. A new dependency may require an allowlist update. Run lint for Go changes and inspect all modifications it makes.

`make audit` runs `govulncheck ./...`. Run it for dependency changes and auth, networking, parsing, file-I/O, concurrency, or security-sensitive work. It complements tests; it does not replace threat-focused regression cases.

## Release packaging

[`.goreleaser.yaml`](https://github.com/openfga/cli/blob/main/.goreleaser.yaml) builds static `fga` binaries for Linux, Windows, and macOS, generates completions/manpages, publishes a multi-architecture container, archives documentation, produces checksums and SBOMs, signs artifacts/images, and updates Homebrew, AUR, and Linux packages.

[`.github/workflows/main.yaml`](https://github.com/openfga/cli/blob/main/.github/workflows/main.yaml) runs lint, audit, build/tests, shellcheck, and a snapshot GoReleaser check on pull requests. Tagged releases add provenance, signing, image publication, package updates, verification, and release undrafting. Release Please is conventional-commit driven.

[`release-please.yml`](https://github.com/openfga/cli/blob/main/.github/workflows/release-please.yml) owns stable `main` releases through manual dispatch or a merged `release:` commit. [`release-please-develop.yml`](https://github.com/openfga/cli/blob/main/.github/workflows/release-please-develop.yml) is a separate alpha/beta/RC lane for `develop`; stable releases must use `main`. The release config maps conventional commit types into changelog sections, and the PR-title workflow enforces the conventional title contract on `main`.

For command, flag, version, linker, install-layout, completion, manpage, or asset changes, run the build/help smoke checks and inspect GoReleaser hooks and package contents. Do not edit release artifacts without updating their source generator.
