# Concrete change workflows

## Add a new command

1. Choose the existing `store`, `model`, `tuple`, or `query` package by responsibility. Create a new package only for a genuinely new top-level noun.
2. Add a `*cobra.Command` with precise `Use`, `Short`, `Long`, `Example`, `Args`, and `RunE`.
3. Register it once in the parent package's `init`.
4. Put command-only flags on `cmd.Flags()`. Reuse inherited store/model/context/consistency flags rather than redeclaring them.
5. Extract a function accepting `context.Context`, `client.SdkClient`, typed input, and options. Keep parsing and display in `RunE`.
6. Build SDK requests with the existing client/config helpers. Wrap operational errors; write only the result to stdout.
7. Add unit tests with generated SDK mocks for success, validation, API errors, and edge cases. Assert the output contract separately.
8. Update README command tables/examples and Cobra help. Add a commander integration case when the command calls a server or its binary behavior matters.
9. Run targeted tests, `make test-unit`, `make test-integration` when server-backed, `make lint`, `make audit` when sensitive, then build/help smoke checks.

## Add a shared configuration option

1. Define the flag at the narrowest parent whose descendants all consume it; root persistent flags are global.
2. Select one canonical hyphenated name. The environment form is `FGA_` plus uppercase underscores, and YAML uses the flag name.
3. Let recursive Viper binding preserve explicit flag > environment > config > default precedence.
4. If the option affects API clients, add a typed field to `fga.ClientConfig`, read it in `GetClientConfig`, and apply it in the centralized SDK `ClientConfiguration`. Never copy client construction into commands.
5. Validate required combinations and secret handling. Keep sensitive values out of errors, debug logs, and output.
6. Extend Viper binding/config tests for scalar or repeated values and explicit-flag precedence.
7. Update README's configuration table and examples; verify root and child help.
8. Run targeted config/client tests, unit tests, integration tests for end-to-end binding, lint, audit for auth/network options, and build/help smoke checks.

## Change the store-file schema

1. Define backward-compatible YAML/JSON names and omitted/empty/null semantics before changing structs.
2. Update `StoreData` or nested test structs, strict decoding, validation, load/resolve behavior, import, export, and local/remote model tests together.
3. For new file references, resolve relative to the containing store file and route reads through `safefile`. Carry the containment base into deferred modular reads.
4. Keep outside references denied by default. If trusted external access is necessary, reuse `--allow-external-files`; do not add a weaker bypass.
5. Add unit fixtures for inline and referenced forms, round-trip export/import, invalid combinations, unknown fields, and all traversal/non-regular-file cases.
6. Update `docs/STORE_FILE.md`, README references, examples, and commander integration tests for both `store import` and `model test`.
7. Run focused storetest/safefile/model/store tests, `make test-unit`, `make test-integration`, `make lint`, `make audit`, and import/export smoke checks.

## Change machine-readable output

1. Capture the current JSON/YAML/CSV and exit behavior in a regression test. Identify scripts documented in README that consume the shape.
2. Prefer an additive typed response field with stable JSON tags. Preserve existing envelopes, keys, types, empty arrays, and CSV columns.
3. Keep human diagnostics on stderr. Ensure non-terminal stdout has no ANSI escapes; include `NO_COLOR=1` in smoke checks where relevant.
4. If a breaking change is unavoidable, add an opt-in output format/version or a deprecation window rather than silently replacing the default.
5. Test the response structure, exact serialized keys/types, empty and error cases, and any JSON-to-YAML/simple-JSON/CSV variants.
6. Add commander assertions for stdout JSON paths, stderr, and exit code. Verify documented pipelines such as store ID extraction and tuple read-to-write.
7. Update README examples and release notes as required, then run output/command tests, unit tests, integration tests, lint, and build/pipeline smoke checks.

## Decide whether another repository is involved

Ask for cross-repository changes only after locating the missing contract:

- protobuf or HTTP API shape: `openfga/api`, then server and Go SDK;
- server semantics/limits: `openfga/openfga`;
- Go client request/auth/retry behavior: `openfga/go-sdk`;
- DSL/modular parsing: `openfga/language`;
- website or other SDK documentation: only when their published behavior is affected.

A Cobra-only command, alias, local validation, formatting option, or store-file feature normally remains in `openfga/cli`.
