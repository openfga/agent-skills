# Store files and the external-file trust boundary

The public format is documented in [`docs/STORE_FILE.md`](https://github.com/openfga/cli/blob/main/docs/STORE_FILE.md). Its implementation is shared by store import and model test in [`internal/storetest`](https://github.com/openfga/cli/tree/main/internal/storetest).

## Schema and loading

[`StoreData`](https://github.com/openfga/cli/blob/main/internal/storetest/storedata.go) contains:

- store `name`;
- inline `model` or `model_file`;
- inline `tuples`, one `tuple_file`, or multiple `tuple_files`;
- tests with inline/referenced tuples plus check, list-objects, and list-users assertions.

[`ReadFromFile`](https://github.com/openfga/cli/blob/main/internal/storetest/read-from-input.go) uses `yaml.Decoder.KnownFields(true)`. Unknown keys fail instead of being silently ignored. It resolves nested references relative to the resolved store file, loads model and tuple content, then validates cross-field rules.

Any schema change must update, in one change:

1. struct fields and JSON/YAML tags;
2. strict decoding and validation rules;
3. model/tuple loading and both local and remote test paths;
4. store import and export;
5. `docs/STORE_FILE.md`, README references, and examples;
6. unit fixtures plus integration cases.

Preserve old fields when feasible. If two representations are mutually exclusive, reject ambiguous input explicitly. Decide how omitted, empty, and `null` values round-trip through export before implementation.

## Import and export

[`cmd/store/import.go`](https://github.com/openfga/cli/blob/main/cmd/store/import.go) creates or updates a store, writes the model, chunks tuple imports, and writes at most the server-supported assertion batch. Progress and truncation warnings go to stderr.

[`cmd/store/export.go`](https://github.com/openfga/cli/blob/main/cmd/store/export.go) reads store metadata, model, tuples, and assertions into `StoreData`, then emits YAML or writes a mode-`0600` file after overwrite confirmation. A schema change must round-trip both inline output and re-import. Preserve `--max-tuples` truncation semantics and avoid claiming an export is complete when it is intentionally capped.

## Default containment

A store or test file is untrusted input. By default, `model_file`, `tuple_file`, `tuple_files`, per-test tuple files, and files listed by a referenced modular model must stay under the directory containing the store file.

[`internal/safefile`](https://github.com/openfga/cli/tree/main/internal/safefile) enforces the boundary with `os.Root`:

- rejects `..` escapes and absolute paths;
- rejects symlinks that resolve outside the root;
- validates and reads through the same rooted lookup to avoid check/use path disagreement;
- rejects directories, FIFOs, devices, and other non-regular files;
- opens nonblocking and re-checks the opened descriptor to reduce swap races.

`--allow-external-files` is an explicit trust opt-in on `store import` and `model test`. Even in that mode, targets must remain regular files.

Do not replace rooted reads with `filepath.Clean`, prefix checks, `EvalSymlinks` followed by `os.ReadFile`, or an existence-only check. Those approaches can reintroduce traversal, symlink, race, FIFO blocking, or unbounded device-read vulnerabilities.

## Required security regression cases

When nested file handling changes, cover:

- valid relative in-tree reference;
- `../` traversal rejected by default;
- absolute path rejected by default;
- outside reference allowed only with `--allow-external-files`;
- symlink escape and mixed symlink/`..` path;
- directory and FIFO/non-regular targets;
- modular `fga.mod` contents escaping the store directory;
- nested base paths for both `store import` and `model test`;
- strict unknown YAML fields.

Use [`internal/storetest/security_test.go`](https://github.com/openfga/cli/blob/main/internal/storetest/security_test.go), Unix-only FIFO tests, authorization-model containment tests, and traversal fixtures under [`tests/fixtures`](https://github.com/openfga/cli/tree/main/tests/fixtures) as the existing pattern.
