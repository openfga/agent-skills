# Architecture and configuration

This reference was verified against `openfga/cli` main at commit [`6571540`](https://github.com/openfga/cli/commit/65715409cba4beb3176f34f1c2aaeac0fb67baca). Re-check the linked paths before changing behavior.

## Command tree

[`cmd/root.go`](https://github.com/openfga/cli/blob/main/cmd/root.go) owns the root command, global configuration, and registration of `store`, `model`, `tuple`, `query`, `version`, and the hidden `man` command. Each group registers children in its package:

- [`cmd/store/store.go`](https://github.com/openfga/cli/blob/main/cmd/store/store.go)
- [`cmd/model/model.go`](https://github.com/openfga/cli/blob/main/cmd/model/model.go)
- [`cmd/tuple/tuple.go`](https://github.com/openfga/cli/blob/main/cmd/tuple/tuple.go)
- [`cmd/query/query.go`](https://github.com/openfga/cli/blob/main/cmd/query/query.go)

Define a command in the package matching its noun, register it exactly once on the parent, and keep reusable behavior in a function that accepts `context.Context` and an SDK interface. Prefer `RunE` so failures are returned rather than printed.

### Local versus persistent flags

- Use `command.Flags()` for an option consumed only by that command.
- Use `parent.PersistentFlags()` only when all descendants share the same meaning. `store-id` is persistent under `tuple` and `query`; `store-id`, `model-id`, contextual tuples, context, and consistency are shared under `query`.
- Root persistent flags are process-wide connection settings. Adding one changes every command's help, environment/config surface, completions, and manpage.
- Preserve old names with Cobra deprecation or a hidden compatibility alias before removal. `server-url` is the current hidden alias for `api-url`.

Required flags can still be satisfied by Viper because binding occurs during Cobra initialization. Test required, inherited, and deprecated behavior rather than assuming the flag location is irrelevant.

## Configuration precedence

[`initConfig`](https://github.com/openfga/cli/blob/main/cmd/root.go) creates an isolated Viper instance. With no `--config`, it looks for `.fga.yml` or `.fga.yaml` in the current directory, the OS user config directory, its `fga` subdirectory, and the home directory. An explicit `--config` selects one file.

The current implementation prints the selected config path to stderr only after a successful read and otherwise ignores `ReadInConfig` errors. Treat stricter handling of a missing or invalid explicit config as an intentional behavior change with command-level tests.

The effective precedence is:

1. an explicitly changed Cobra flag;
2. `FGA_*` environment variables, with hyphens converted to underscores;
3. the selected YAML config file;
4. the Cobra flag default.

[`BindViperToFlags`](https://github.com/openfga/cli/blob/main/internal/cmdutils/bind-viper-to-flags.go) recursively sets only unchanged flags. It uses `GetStringSlice`, so scalar values are stringified and space-separated environment values become repeated array entries. Extend [`bind-viper-to-flags_test.go`](https://github.com/openfga/cli/blob/main/internal/cmdutils/bind-viper-to-flags_test.go) for new value shapes.

When adding a shared option:

1. define the persistent flag at the narrowest common ancestor;
2. use the hyphenated flag/config key and the derived `FGA_UPPER_SNAKE_CASE` environment key;
3. read it from the executing command's flags;
4. add it to [`README.md`'s configuration table](https://github.com/openfga/cli#configuration);
5. test explicit-flag precedence and at least environment and YAML binding.

Do not introduce a second configuration path around Viper.

## Client, auth, and headers

[`GetClientConfig`](https://github.com/openfga/cli/blob/main/internal/cmdutils/get-client-config.go) translates flags into [`fga.ClientConfig`](https://github.com/openfga/cli/blob/main/internal/fga/fga.go). The latter creates `client.ClientConfiguration` for `github.com/openfga/go-sdk`.

Current authentication behavior:

- `api-token` selects API-token credentials and takes precedence when present.
- Otherwise, a non-empty `client-id` selects client credentials using client secret, token issuer, audience, and space-joined scopes.
- Otherwise, the SDK uses no credentials.
- Cobra requires token issuer, client ID, and client secret together. Preserve this validation when reorganizing flags.

Custom headers are repeated `Header-Name:value` strings. Parsing splits at the first colon, trims name/value whitespace, and lets the last repeated value for a name win in the map. The current parser rejects an empty name but does not require that a colon was found, so tightening this is a compatibility change. Headers become SDK `DefaultHeaders`, so every request receives them. Preserve repeated flag/config behavior, and never log token, secret, or sensitive header values. The client also sets the CLI user agent, SDK retry count, retry wait, and debug setting; keep those centralized.

## Request and error flow

Commands should use the SDK's fluent request interfaces and `cmd.Context()`:

```go
response, err := fgaClient.Check(cmd.Context()).Body(body).Options(options).Execute()
```

Wrap errors with the failed operation and `%w`. [`internal/clierrors`](https://github.com/openfga/cli/blob/main/internal/clierrors/clierrors.go) contains sentinels used for validation and format failures. Do not turn an API or parse failure into an empty successful response.

The root has `SilenceUsage: true`; [`Execute`](https://github.com/openfga/cli/blob/main/cmd/root.go) exits with status 1 when Cobra returns an error. Avoid `os.Exit` inside reusable code because it bypasses defers and unit tests. Existing direct exits, such as failed `model test` assertions, require binary/integration coverage when changed.

Keep stdout machine-readable. Deprecation notices, config-file notices, progress bars, warnings, test summaries, and debug diagnostics belong on stderr.

## Cross-repository boundary

The CLI currently depends on `github.com/openfga/api/proto`, `github.com/openfga/go-sdk`, and `github.com/openfga/openfga` (the last is used for the in-process model-test server). Keep a change inside `openfga/cli` when released request/response and server behavior already support it.

Coordinate other repositories only when evidence requires it:

- a new or changed wire field/endpoint starts in [`openfga/api`](https://github.com/openfga/api), then requires compatible server and Go SDK support before CLI wiring;
- SDK request-builder, auth, retry, or response-type behavior belongs in [`openfga/go-sdk`](https://github.com/openfga/go-sdk), not a CLI HTTP workaround;
- server semantics or limits require [`openfga/openfga`](https://github.com/openfga/openfga) coverage;
- website or multi-language SDK changes are not automatic for a CLI-only command, flag, formatting, or local store-file change. Request them only when the public contract they own changes.
