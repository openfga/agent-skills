---
title: Connectivity and Client Decision Trees
---

# Connectivity and Client Decision Trees

## Authentication or authorization failure

1. Capture the encoded OpenFGA error code and request ID, not the token.
2. Classify it:
   - Missing/invalid bearer token: verify the selected auth method and that the client sends a bearer token through its normal secret provider.
   - Invalid issuer/audience/claims: compare sanitized issuer and audience names, token expiry, and required claims with server configuration.
   - `unauthenticated`: establish identity first.
   - `forbidden`: identity succeeded but API authorization denied the action; keep it separate from a model-level Check deny.
3. For CLI client credentials, configure issuer, client ID, and client secret together. Never paste a secret into an issue, command transcript, or committed `.fga.yaml`.
4. Confirm client and server clocks when validating expiring credentials.
5. If experimental server access control is enabled, record that fact and its version. Do not recommend it for production as a troubleshooting workaround.

## Endpoint, network, or TLS failure

1. Identify protocol and port:
   - HTTP default: `8080`
   - gRPC default: `8081`
   - Prometheus metrics default: `2112`
2. Test the health endpoint from the same network boundary as the failing client:

   ```bash
   curl --fail --show-error --silent "$FGA_API_URL/healthz"
   ```

   Expected serving response: `{"status":"SERVING"}`.
3. If health works but API calls fail, compare path/protocol, proxy or ingress routing, auth headers, and client timeout.
4. If TLS fails, verify hostname/SAN, trust chain, expiry, and whether HTTP TLS and gRPC TLS are enabled independently. Never disable certificate validation as the fix.
5. If connection is refused or times out, verify the configured bind address, published container/service port, network policy/firewall, and proxy upstream.
6. Record DNS and certificate metadata, not private keys or bearer headers.

## CLI or SDK configuration mismatch

OpenFGA server configuration uses the precedence flags > `OPENFGA_*` environment variables > config file. The `fga` CLI has its own flags, environment/config handling, and default API URL. Do not treat these as one configuration system.

The CLI searches for `.fga.yaml`/`.fga.yml` and accepts flag names as keys:

```yaml
api-url: https://fga.example.test
store-id: synthetic-store-id
model-id: synthetic-model-id
```

Never put `api-token`, `client-secret`, or other credentials in a reproduction file. Explicit CLI flags override `FGA_*` environment variables, which override the CLI config file.

1. Make endpoint, store ID, and model ID explicit in one diagnostic CLI request.
2. Compare those values with the SDK request and deployment environment.
3. Check for a stale `.fga.yaml`, environment variable, deprecated `--server-url`, or a profile from another environment.
4. Run `fga version`, then compare SDK/CLI versions and generated user agent with server logs.
5. Use SDK telemetry attributes for request method, store/model ID, URL, and response model ID when enabled. Redact identifier values before sharing.
6. Reproduce with the CLI. If CLI and SDK differ with identical inputs, capture both sanitized wire requests, versions, request IDs, and error bodies; do not assume the server is at fault.

Example targeted Check without a token in the transcript:

```bash
fga query check \
  --api-url "$FGA_API_URL" \
  --store-id "$FGA_STORE_ID" \
  --model-id "$FGA_MODEL_ID" \
  user:anne can_view document:roadmap \
  --consistency HIGHER_CONSISTENCY
```

Supply authentication through the user's existing secure mechanism. Never add a literal token to an example.

## Official sources

- [Configure OpenFGA](https://openfga.dev/docs/getting-started/setup-openfga/configure-openfga)
- [OpenFGA configuration](https://openfga.dev/docs/getting-started/setup-openfga/configuration)
- [CLI documentation](https://openfga.dev/docs/getting-started/cli)
- [Configure telemetry](https://openfga.dev/docs/getting-started/configure-telemetry)
