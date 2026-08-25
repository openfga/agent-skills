# Architecture and Boundaries

Reconfirm these paths on the working branch before editing.

## Transport and middleware

`cmd/run/run.go` is the composition root:

- `ServerContext.Run` creates the service, registers the OpenFGA and AuthZEN gRPC servers, and starts listeners.
- `runHTTPServer` registers generated grpc-gateway handlers. HTTP requests are proxied to the same gRPC service, normally over a local Unix socket.
- `buildServerOpts` composes recovery, context tags, request IDs, request timeout, store ID tagging, logging, protobuf validation, metrics/tracing, and authentication interceptors.

Keep panic recovery first. Middleware ordering is observable: logging needs tags, handlers rely on validator context, and API authorization relies on authentication claims.

Relevant sources:

- `cmd/run/run.go`
- `internal/middleware/authn/authn.go`
- `pkg/middleware/`
- `pkg/gateway/`

## Handler responsibilities

Handlers in `pkg/server/` should:

1. Validate when the validator interceptor has not already done so.
2. Attach telemetry metadata.
3. Call API authorization before protected datastore or graph work.
4. Resolve the requested or latest typesystem when needed.
5. Construct a command/query with explicit limits and dependencies.
6. Execute it using the request context.
7. Convert domain errors to stable API errors.
8. Emit response and resolution metadata.

Use these representative flows:

- `pkg/server/check.go` -> `pkg/server/commands/check_command.go`
- `pkg/server/check.go` -> `pkg/server/commands/check.go` -> `internal/check/` for the feature-gated weighted-graph path
- `pkg/server/list_objects.go` -> `pkg/server/commands/list_objects.go`
- `pkg/server/list_users.go` -> `pkg/server/commands/listusers/`
- `pkg/server/write.go` -> `pkg/server/commands/write.go`

Do not duplicate business logic between HTTP and gRPC or embed reusable domain behavior in a handler.

Check currently has two resolution implementations. The standard path uses the circular `internal/graph` resolver chain. The feature-gated weighted-graph path uses `internal/modelgraph` and the separate resolver contracts in `internal/check`, with terminal-error classification, fallback to the standard path, optional shadow execution, and divergence diagnostics. A Check semantic change may require coordinated fixes and tests in both engines.

## Command responsibilities

Commands in `pkg/server/commands/`:

- Accept explicit domain dependencies, not transport objects.
- Validate model-dependent input at the correct strictness.
- Compose contextual tuples and storage wrappers.
- Apply consistency, concurrency, cache, throttling, and deadline options.
- Return domain results and errors that handlers can map.

For Check, `CheckQuery.Execute` validates the request, constructs a `ResolveCheckRequest`, attaches the typesystem and request tuple reader to context, invokes the resolver, and returns resolution/datastore metadata.

## Error boundary

Use typed or sentinel domain errors and wrap with `%w`. Match with `errors.Is` or `errors.As`.

- Endpoint converters such as `commands.CheckCommandErrorToServerError` map expected domain failures.
- `pkg/server/errors/` owns encoded public errors and generic fallback handling.
- Context deadlines, throttling, resolution depth, tuple validation, and condition failures need intentional mappings.

Never return raw SQL, cache, parser, or internal graph errors to clients. Test both the public code and message stability when callers depend on them.

## Source map

| Concern | Current source |
|---|---|
| Startup and graceful shutdown | `cmd/run/run.go`, `cmd/run/cleanups.go` |
| gRPC/HTTP registration | `cmd/run/run.go` |
| Endpoint handlers | `pkg/server/` |
| Business commands | `pkg/server/commands/` |
| Standard Check engine | `internal/graph/` |
| Weighted-graph Check engine | `internal/check/`, `internal/modelgraph/`, `pkg/server/commands/check.go` |
| ListObjects engine | `internal/listobjects/`, `pkg/server/commands/list_objects.go` |
| ListUsers engine | `pkg/server/commands/listusers/` |
| Type/model validation | `pkg/typesystem/`, `internal/validation/` |
| Storage contracts/backends | `pkg/storage/` |
| Authentication/authorization | `internal/authn/`, `internal/authz/` |
| Configuration | `pkg/server/config/`, `cmd/run/`, `.config-schema.json` |
