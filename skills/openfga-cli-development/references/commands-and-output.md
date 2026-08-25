# Commands and output compatibility

## Follow the existing workflow boundaries

| Area | Primary source | Responsibilities |
|------|----------------|------------------|
| Stores | [`cmd/store`](https://github.com/openfga/cli/tree/main/cmd/store) | create, get, list, delete, import, export |
| Models | [`cmd/model`](https://github.com/openfga/cli/tree/main/cmd/model) | write, get/list, validate, transform, test |
| Tuples | [`cmd/tuple`](https://github.com/openfga/cli/tree/main/cmd/tuple) and [`internal/tuple`](https://github.com/openfga/cli/tree/main/internal/tuple) | read, write, delete, changes, file import |
| Queries | [`cmd/query`](https://github.com/openfga/cli/tree/main/cmd/query) | check, expand, list objects, list relations, list users |
| Rendering | [`internal/output`](https://github.com/openfga/cli/tree/main/internal/output) | JSON, YAML, CSV, TTY color |

Keep parsing, validation, request construction, and rendering as separate steps. Tests should call the request/workflow function with a generated SDK mock rather than requiring a live server.

## Authorization model formats

[`internal/authorizationmodel`](https://github.com/openfga/cli/tree/main/internal/authorizationmodel) supports:

- OpenFGA DSL (`fga`);
- API-shaped JSON (`json`);
- modular models (`modular`) rooted at an `fga.mod` file.

Autodetection recognizes `fga.mod` as modular and `.json` as JSON, defaulting other input to DSL. Model `write`, `validate`, `transform`, store create/import, and local model tests must agree on format semantics. Modular contents are deferred file reads, so a store-file containment base must survive until model parsing.

Use `github.com/openfga/language` for DSL/protobuf transformations and API/SDK types for JSON shape. An API model-field change may therefore require upstream API, language, server, or SDK support; a new CLI input alias usually does not.

## Tuple and query behavior

Tuple input supports JSON, JSONL, YAML, and CSV in the tuple-file package; verify the exact command-specific list before documenting a format. Conditions carry a name and JSON context. `tuple write` retains `import` as a compatibility alias. Single tuple writes default duplicate handling to `error`, while file writes default to `ignore`; deletes follow the analogous `on-missing` behavior.

Query commands share store/model ID, contextual tuples, JSON context, and consistency flags. `check`, `expand`, `list-objects`, and `list-users` map directly to typed SDK operations. `list-relations` reads the selected or latest authorization model when no relation filter is supplied, then sends the candidate relation set to the SDK. Construct typed SDK bodies and options, omit unspecified consistency where existing helpers do, and return the SDK error with command context.

`model test` has two modes:

- with an inline or referenced model, it starts an in-memory OpenFGA server and writes model/tuples locally;
- without a model, it runs against the configured remote store using contextual tuples.

Changes to either path need tests in [`internal/storetest`](https://github.com/openfga/cli/tree/main/internal/storetest). Server limits still apply to remote contextual tuples.

## Pagination

Pagination is command-specific and observable:

- store and model lists default to bounded page counts;
- tuple reads default to 20 pages, while `--max-pages=0` means all pages and changes the default page size to 100;
- tuple changes accept a starting continuation token and return the final token;
- page-size validation belongs before the SDK call.

Read implementations and their tests together: [`cmd/store/list.go`](https://github.com/openfga/cli/blob/main/cmd/store/list.go), [`cmd/model/list.go`](https://github.com/openfga/cli/blob/main/cmd/model/list.go), [`cmd/tuple/read.go`](https://github.com/openfga/cli/blob/main/cmd/tuple/read.go), [`cmd/tuple/changes.go`](https://github.com/openfga/cli/blob/main/cmd/tuple/changes.go), and [`internal/tuple/read.go`](https://github.com/openfga/cli/blob/main/internal/tuple/read.go).

When changing pagination, test empty pages, one page, multiple pages, exact limits, no limit, token propagation, repeated/empty tokens, and SDK errors. Preserve whether the aggregated response exposes a continuation token.

## Batching, parallelism, and rate limiting

Tuple file writes/deletes and store imports chunk work and use SDK transaction options. [`internal/tuple/import.go`](https://github.com/openfga/cli/blob/main/internal/tuple/import.go) owns tuple-per-write and parallel-request validation. Optional `--max-rps` enables [`internal/requests/rampup.go`](https://github.com/openfga/cli/blob/main/internal/requests/rampup.go); omitted related flags derive defaults from the requested rate.

- Validate positive values and integer bounds before allocating chunks or channels.
- Propagate context cancellation.
- Bound concurrency; do not create an unbounded goroutine per tuple.
- Preserve conflict semantics and successful/failed tuple accounting.
- Do not promise deterministic completion order for parallel requests unless the implementation enforces it.
- Add tests for chunk boundaries, mixed writes/deletes, partial failures, rate defaults, and cancellation.

## Machine-readable output is an API

[`output.Display`](https://github.com/openfga/cli/blob/main/internal/output/marshal.go) emits pretty/color JSON on a terminal and compact JSON when stdout is not a terminal. `NO_COLOR` disables color. `NewUniPrinter` supports JSON or YAML, and tuple reads additionally support simple JSON and CSV. Unlike `Display`, `NewUniPrinter` selects color from `NO_COLOR` rather than terminal detection, so include `NO_COLOR=1` in redirected-output smoke checks.

Compatibility rules:

- Preserve JSON/YAML keys, types, omission behavior, empty collection shape, and top-level envelopes.
- Keep simple tuple JSON writable by `fga tuple write` and deletable by `fga tuple delete`.
- Keep CSV headers and order stable; add columns only with explicit compatibility consideration.
- Never mix summaries, warnings, progress, or config notices into stdout.
- Prefer additive fields. For a breaking rename, retain the old field or add an opt-in format/version before removal.
- Stabilize map-derived output ordering before asserting or documenting it.
- Test both serialization structures and binary stdout/stderr when the renderer or command path changes.

Examples in [`README.md`](https://github.com/openfga/cli/blob/main/README.md) are part of the contract: scripts use outputs such as `.store.id`, `authorization_model_id`, tuple `successful`/`failed` counts, and `simple-json` pipelines.
