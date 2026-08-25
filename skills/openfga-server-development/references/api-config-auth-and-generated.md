# API, Config, Auth, and Generated Files

## Wire API changes begin in `openfga/api`

If a request, response, service, route, field, validation rule, or generated client contract changes:

1. Create and merge the protobuf/gateway change in `github.com/openfga/api`.
2. Consume the released or pinned API module version in `openfga/openfga` with `go get github.com/openfga/api@<version>` and review the resulting module changes.
3. Update handler, command, error mapping, authorization mapping, and tests.
4. Validate both direct gRPC and grpc-gateway HTTP behavior.

Do not edit protobuf definitions or `*.pb.go` in the server repository. The current dependency is declared in `go.mod` as `github.com/openfga/api/proto`.

## New endpoint checklist

- Add/consume the generated service contract from `openfga/api`.
- Add the API method identifier in `internal/utils/apimethod/`.
- Add the handler under `pkg/server/`.
- Put reusable behavior in `pkg/server/commands/`.
- Authorize it through `internal/authz/authz.go`; unknown methods must fail closed.
- Map domain failures through `pkg/server/errors/` or an endpoint converter.
- Wire any server dependency through explicit options.
- Add handler/command tests and `tests/functional_test.go` coverage.
- Add query matrix assertions if authorization membership semantics are involved.
- Update `TestHTTPHeaders` in `cmd/run/run_test.go` if headers change.

The generated service registration in `cmd/run/run.go` exposes the endpoint to gRPC and HTTP after the API dependency is updated.

## Config and flag workflow

A server setting is incomplete until all applicable surfaces agree:

1. Struct, default, loading, and validation in `pkg/server/config/`.
2. User-facing schema and environment metadata in `.config-schema.json`.
3. Cobra flag declaration in `cmd/run/run.go`.
4. Viper flag and environment binding in `cmd/run/flags.go`.
5. Server option/state in `pkg/server/server.go`.
6. Startup wiring in `ServerContext.Run`.
7. Config, flag/env, server-option, and behavior tests.
8. Changelog and operator documentation.

Use a safe default. Prefer a disabled experimental flag for behavior that is not ready as the production default. Preserve legacy environment aliases only when compatibility requires them.

Secret fields must be excluded from logs and serialization, as datastore passwords and preshared keys are today.

## Authentication and API authorization

Authentication implementations live in:

- `internal/authn/`
- `internal/authn/oidc/`
- `internal/authn/presharedkey/`
- `internal/middleware/authn/`

API authorization lives in `internal/authz/` and is wired through `pkg/server/`.

For auth changes:

- validate required combinations at startup;
- reject missing, malformed, wrong-audience, wrong-issuer, or unauthorized credentials;
- use constant-time comparison for secrets;
- handle key rotation and cleanup;
- preserve claims through middleware context;
- never downgrade to unauthenticated/no-op behavior after configuration errors;
- add negative tests for each invalid path and ensure errors reveal no secrets.

Access-control configuration requires coordinated config validation, authorizer construction, API method mapping, handler checks, and store/module isolation tests.

## Generated mocks

Generated files declare `Code generated ... DO NOT EDIT` and are driven by `//go:generate` or repository generation commands.

- Change the source interface.
- Run `make generate-mocks`.
- Review generated diffs for only expected interface changes.
- Commit regenerated files with the source change.

Important generated areas include `internal/mocks/`, `internal/graph/mock_check_resolver.go`, and `internal/check/mock_resolver.go`.

## Imports and lint

`.golangci.yaml` enforces:

- `openfgav1` for `github.com/openfga/api/proto/openfga/v1`;
- `parser` for `github.com/openfga/language/pkg/go/transformer`;
- import grouping: standard, external, `github.com/openfga`, local module;
- error wrapping and other correctness/performance checks.

Run `make lint` rather than manually approximating the formatter/linter set. The target uses `--fix`, so inspect the resulting diff.
