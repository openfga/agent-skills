# Security and Networking

## Authentication Boundary

Supported server authentication methods are `none`, `preshared`, and `oidc`.

- Use `none` only for local development or when a separately enforced, reviewed trust boundary prevents untrusted access.
- Use `preshared` or `oidc` for production endpoints that cross a trust boundary.
- When using preshared keys or OIDC, enable TLS at OpenFGA or terminate TLS at a trusted proxy/load balancer and protect the proxy-to-server network.
- Rotate preshared keys and OIDC credentials through the deployment's secret system. Do not place them in Git, command history, rendered manifests, or incident output.

Relevant public settings include:

```text
OPENFGA_AUTHN_METHOD
OPENFGA_AUTHN_PRESHARED_KEYS
OPENFGA_AUTHN_OIDC_ISSUER
OPENFGA_AUTHN_OIDC_AUDIENCE
OPENFGA_AUTHN_OIDC_ISSUER_ALIASES
OPENFGA_AUTHN_OIDC_SUBJECTS
OPENFGA_AUTHN_OIDC_CLIENT_ID_CLAIMS
```

OpenFGA's built-in access-control feature is experimental, has bootstrap limitations, and is not recommended for production. Do not present it as a replacement for a production network/authentication boundary.

## TLS and Listeners

Verify release-specific names in `.config-schema.json`. Current public controls include:

```text
OPENFGA_GRPC_ADDR
OPENFGA_GRPC_TLS_ENABLED
OPENFGA_GRPC_TLS_CERT
OPENFGA_GRPC_TLS_KEY
OPENFGA_HTTP_ENABLED
OPENFGA_HTTP_ADDR
OPENFGA_HTTP_TLS_ENABLED
OPENFGA_HTTP_TLS_CERT
OPENFGA_HTTP_TLS_KEY
OPENFGA_HTTP_UPSTREAM_TIMEOUT
OPENFGA_HTTP_CORS_ALLOWED_ORIGINS
OPENFGA_HTTP_CORS_ALLOWED_HEADERS
```

- Bind only required interfaces and expose only required ports.
- Restrict CORS to known origins and headers; do not carry a wildcard example into production without explicit review.
- Ensure proxy, load-balancer, service, and server timeouts agree with OpenFGA request and operation deadlines.
- Keep certificate and key files read-only and sourced from a secret mechanism.
- Test both HTTP and gRPC paths if both are enabled.

The HTTP gateway connects internally to gRPC and may use a Unix-domain socket under `/tmp`. For a read-only container filesystem, preserve a writable `tmpfs` at `/tmp` as documented by the server README.

## Exposure Review

Create an explicit table before deployment:

| Surface | Intended callers | Authentication | TLS | Network restriction |
|---|---|---|---|---|
| HTTP API | Application clients | Required decision | Required decision | Ingress/service policy |
| gRPC API | Application clients | Required decision | Required decision | Service policy |
| Metrics | Collector only | Platform-specific | Platform-specific | Internal only |
| Health | Orchestrator/load balancer | Platform-specific | Platform-specific | Internal only |
| Profiler | Break-glass operators only | External control | Required | Disabled by default |
| Playground | None in production | N/A | N/A | Disabled |

Do not expose metrics, health, or profiler ports merely because chart values make them available. The optional Helm Ingress routes only what is configured; inspect the rendered Service and Ingress.

## Secret Handling

- Prefer existing Kubernetes Secret references or an external secret integration over inline chart values.
- Review rendered manifests because inline values can become Kubernetes Secret objects and may still appear in release history or CI output.
- Separate datastore credentials, auth credentials, and TLS material so each can rotate independently.
- Avoid logging environment dumps.
- Redact DSNs completely, not just the password substring.

## Official Sources

- [Configure authentication and TLS](https://openfga.dev/docs/getting-started/setup-openfga/configure-openfga)
- [Experimental access control](https://openfga.dev/docs/getting-started/setup-openfga/access-control)
- [Server configuration schema](https://github.com/openfga/openfga/blob/main/.config-schema.json)
- [Server container notes](https://github.com/openfga/openfga/blob/main/README.md)
- [Helm secret guidance](https://github.com/openfga/helm-charts/blob/main/charts/openfga/README.md)
- [Helm Service template](https://github.com/openfga/helm-charts/blob/main/charts/openfga/templates/service.yaml)
- [Helm Ingress template](https://github.com/openfga/helm-charts/blob/main/charts/openfga/templates/ingress.yaml)
