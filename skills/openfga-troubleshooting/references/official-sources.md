---
title: Official Source Pointers
---

# Official Source Pointers

Use the deployed release's documentation and source when behavior is version-sensitive. The commit-pinned pointers below record the public behavior researched for this skill on 2026-08-25; they are navigation evidence, not permission to depend on private implementation details.

## Documentation

- [Server configuration](https://openfga.dev/docs/getting-started/setup-openfga/configuration)
- [CLI configuration and commands](https://openfga.dev/docs/getting-started/cli)
- [Testing authorization models](https://openfga.dev/docs/modeling/testing)
- [Relationship queries](https://openfga.dev/docs/interacting/relationship-queries)
- [Conditions](https://openfga.dev/docs/modeling/conditions)
- [Contextual tuples](https://openfga.dev/docs/interacting/contextual-tuples)
- [Consistency](https://openfga.dev/docs/interacting/consistency)
- [Immutable models](https://openfga.dev/docs/getting-started/immutable-models)
- [Production guidance](https://openfga.dev/docs/best-practices/running-in-production)
- [Runtime issue reporting](https://openfga.dev/docs/getting-started/setup-openfga/reporting-runtime-issues)

## Public source snapshots

| Behavior | Public source |
|----------|---------------|
| CLI `.fga.yaml` discovery and `FGA_*` binding | [`openfga/cli` `root.go`](https://github.com/openfga/cli/blob/65715409cba4beb3176f34f1c2aaeac0fb67baca/cmd/root.go#L88-L114) |
| CLI config values bound to flags | [`BindViperToFlags`](https://github.com/openfga/cli/blob/65715409cba4beb3176f34f1c2aaeac0fb67baca/internal/cmdutils/bind-viper-to-flags.go#L26-L36) |
| CLI endpoint/store/model/auth config | [`GetClientConfig`](https://github.com/openfga/cli/blob/65715409cba4beb3176f34f1c2aaeac0fb67baca/internal/cmdutils/get-client-config.go#L20-L49) |
| `fga version` output | [`version.go`](https://github.com/openfga/cli/blob/65715409cba4beb3176f34f1c2aaeac0fb67baca/cmd/version.go#L24-L35) |
| `X-Request-Id` and trace-ID correlation | [`requestid.go`](https://github.com/openfga/openfga/blob/1d4a04773760ba96948cecab306067be4b8c084a/pkg/middleware/requestid/requestid.go#L21-L33) |
| Structured request log fields | [`logging.go`](https://github.com/openfga/openfga/blob/1d4a04773760ba96948cecab306067be4b8c084a/pkg/middleware/logging/logging.go#L25-L40) |
| Public error conversion | [`errors.go`](https://github.com/openfga/openfga/blob/1d4a04773760ba96948cecab306067be4b8c084a/pkg/server/errors/errors.go#L128-L144) |
| Migration flag/environment bindings | [`migrate/flags.go`](https://github.com/openfga/openfga/blob/1d4a04773760ba96948cecab306067be4b8c084a/cmd/migrate/flags.go#L13-L42) |
| Public API error enums | [`errors_ignore.pb.go`](https://github.com/openfga/api/blob/6981fff8d33bee21dd9a2001608e6d6c5f553977/proto/openfga/v1/errors_ignore.pb.go) |
| ListObjects response has no continuation token | [`ListObjectsResponse`](https://github.com/openfga/api/blob/6981fff8d33bee21dd9a2001608e6d6c5f553977/proto/openfga/v1/openfga_service.pb.go#L134-L139) |
| ListUsers response has no continuation token | [`ListUsersResponse`](https://github.com/openfga/api/blob/6981fff8d33bee21dd9a2001608e6d6c5f553977/proto/openfga/v1/openfga_service.pb.go#L281-L286) |
| Tuple Read response continuation token | [`ReadResponse`](https://github.com/openfga/api/blob/6981fff8d33bee21dd9a2001608e6d6c5f553977/proto/openfga/v1/openfga_service.pb.go#L610-L616) |
| Tuple changes response continuation token | [`ReadChangesResponse`](https://github.com/openfga/api/blob/6981fff8d33bee21dd9a2001608e6d6c5f553977/proto/openfga/v1/openfga_service.pb.go#L2200-L2206) |
| Model-list response continuation token | [`ReadAuthorizationModelsResponse`](https://github.com/openfga/api/blob/6981fff8d33bee21dd9a2001608e6d6c5f553977/proto/openfga/v1/openfga_service.pb.go#L1872-L1878) |

Reconfirm flag names and defaults with the actual server's `openfga run --help`, the CLI's `fga version`, release notes, and the configuration documentation for that release. Experimental features and defaults change; do not hardcode "latest."
