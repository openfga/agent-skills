# Official SDK Source Map

Use these pointers to confirm the installed SDK's current API. Prefer the high-level client request types over constructing generated transport models directly. Do not copy an entire SDK README into application guidance.

Common configuration in every language:

- API URL;
- store ID;
- pinned authorization model ID;
- credentials from secret-backed configuration;
- bounded retries and timeouts;
- optional default/per-request headers without sensitive data.

| Language | Official SDK | Integration-specific pointers |
|---|---|---|
| JavaScript/TypeScript | [`openfga/js-sdk`](https://github.com/openfga/js-sdk) (`@openfga/sdk`) | `OpenFgaClient` configuration includes `apiUrl`, `storeId`, `authorizationModelId`, `credentials`, `baseOptions`, and `retryParams`. Request options can override headers/model/store/consistency. Configure timeout/abort behavior through Axios options or an injected instance. Distinguish server `batchCheck` from client-side batching helpers. Streamed ListObjects is Node.js-only. |
| Go | [`openfga/go-sdk`](https://github.com/openfga/go-sdk) | `client.NewSdkClient` accepts `ClientConfiguration` including an injected `HTTPClient`, retry settings, and default headers. Every operation accepts `context.Context`; propagate request cancellation and deadlines. Request options can override headers/store/model. |
| Python | [`openfga/python-sdk`](https://github.com/openfga/python-sdk) (`openfga_sdk`) | Async and sync clients are available. Configure `timeout_millisec`, retries, credentials, and headers; close the client with its context manager. Async cancellation uses normal task/timeout mechanisms. Per-call options are dictionaries and vary by operation. |
| Java | [`openfga/java-sdk`](https://github.com/openfga/java-sdk) (`dev.openfga:openfga-sdk`) | `ClientConfiguration` exposes connect/read timeouts, retries, credentials, and default headers. Operations return `CompletableFuture`; bound work with configured timeouts and application future cancellation. Per-operation options expose headers/model/consistency. Current non-transactional write options chunk but do not provide the parallel-write option available in some other SDKs. |
| .NET | [`openfga/dotnet-sdk`](https://github.com/openfga/dotnet-sdk) (`OpenFga.Sdk`) | Inject/reuse `HttpClient`, configure its timeout, and pass `CancellationToken` through every typed method. Configuration and request options support default/custom headers and model/store/consistency overrides. |

## API-shape differences to verify

- SDK input naming follows language conventions; REST/protobuf uses `snake_case`.
- High-level Check requests commonly flatten `user`, `relation`, and `object`; REST wraps them in `tuple_key`.
- Check/ListObjects REST contextual tuples use `{"tuple_keys":[...]}`; ListUsers uses a direct contextual tuple array.
- Raw BatchCheck returns a map keyed by correlation ID; high-level SDK results may be a list.
- SDK convenience writes can chunk and parallelize beyond one server transaction; read the transaction options before using them.
- ListUsers returns structured user variants, not only object strings.
- Only use an option shown by the installed SDK version; do not infer parity from another language.

## Direct server API

For an unsupported language, generate or maintain a client from the canonical contract:

- [OpenFGA API protobuf and OpenAPI definitions](https://github.com/openfga/api)
- [OpenFGA API reference](https://openfga.dev/api/service)

Implement TLS/auth, connection reuse, deadlines, cancellation, `Retry-After`, typed error handling, pagination where present, and bounded retries. Preserve exact API field shapes from the contract.

## CLI verification

Use the official [`fga` CLI](https://github.com/openfga/cli) for deployment and operator workflows. It recognizes `FGA_API_URL`, `FGA_STORE_ID`, and `FGA_MODEL_ID`, with explicit flags taking precedence. Keep credentials in supported environment/configuration mechanisms and out of shell history.

Do not invoke the CLI for each application authorization decision.
