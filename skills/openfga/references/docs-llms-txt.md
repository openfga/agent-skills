---
title: Look Up Current Docs via llms.txt
---

## Look Up Current Docs via llms.txt

When an integration task goes beyond the rules in this skill (running the server, configuring an SDK client, API behavior, consistency, production tuning), look it up in the official OpenFGA documentation instead of answering from memory. The docs publish machine-readable entry points designed for LLMs and agents.

| Resource | URL | Use it for |
|----------|-----|------------|
| Docs index | `https://openfga.dev/docs/llms.txt` | Small index (~30 KB) of every docs page with a one-line summary. Fetch this first to find the right page. |
| Full docs | `https://openfga.dev/docs/llms-full.txt` | Every docs page concatenated into one Markdown file (~900 KB). Download and search it; do not load it whole into context. |
| Single page as Markdown | `https://openfga.dev/docs/<path>.md` | Any docs page, as Markdown, by appending `.md` to its URL. |

**Incorrect (guessing version-sensitive details):**

```text
"The default ListObjects result limit is 100, and BatchCheck accepts up to 1000 checks."
```

Configuration flags, defaults, experimental APIs, and SDK method names change between releases. Guessing them produces broken integrations.

**Correct (look it up, then cite the page):**

```text
1. Fetch https://openfga.dev/docs/llms.txt
2. Find "OpenFGA Configuration Options" -> https://openfga.dev/docs/getting-started/setup-openfga/configuration.md
3. Read the defaults: OPENFGA_LIST_OBJECTS_MAX_RESULTS = 1000, OPENFGA_MAX_CHECKS_PER_BATCH_CHECK = 50
4. Answer and link https://openfga.dev/docs/getting-started/setup-openfga/configuration
```

### Lookup Workflow

1. Fetch `llms.txt` and pick the page(s) whose title or summary matches the task. Links in `llms.txt` already end in `.md`.
2. Fetch only those pages.
3. Use `llms-full.txt` only when you need to search for a term across all pages. Each page in it starts with `# <Title>` followed by a `Source: <url>` line, so you can trace a match back to its page:

```bash
curl -sSL https://openfga.dev/docs/llms-full.txt -o /tmp/openfga-llms-full.txt
grep -n "HIGHER_CONSISTENCY" /tmp/openfga-llms-full.txt
grep -n "^Source: " /tmp/openfga-llms-full.txt   # page boundaries
```

4. When explaining behavior to the user, link the human-readable page URL (without `.md`).

### Where to Look for Common Adopter Tasks

All paths are relative to `https://openfga.dev/docs/`. Append `.md` to fetch as Markdown.

| Task | Docs pages |
|------|------------|
| Run an OpenFGA server | `getting-started/setup-openfga/docker`, `getting-started/setup-openfga/kubernetes`, `getting-started/setup-openfga/configuration` |
| Run OpenFGA in production | `best-practices/running-in-production` |
| Install and configure an SDK client | `getting-started/install-sdk`, `getting-started/setup-sdk-client` |
| Create a store and write a model | `getting-started/create-store`, `getting-started/configure-model`, `getting-started/immutable-models` |
| Write and delete tuples | `getting-started/update-tuples`, `interacting/managing-user-access`, `interacting/managing-relationships-between-objects` |
| Check, ListObjects, ListUsers | `getting-started/perform-check`, `getting-started/perform-list-objects`, `getting-started/perform-list-users`, `interacting/relationship-queries` |
| Contextual tuples and token claims | `interacting/contextual-tuples`, `modeling/token-claims-contextual-tuples` |
| Consistency and caching | `interacting/consistency` |
| Model IDs and PII in tuples | `getting-started/tuples-api-best-practices` |
| Filter search results by permission | `interacting/search-with-permissions` |
| Sync tuple changes to other systems | `interacting/read-tuple-changes` |
| Integrate with a web framework | `getting-started/framework` |
| SDK telemetry (OpenTelemetry) | `getting-started/configure-telemetry` |
| Use the CLI and store files | `getting-started/cli`, `modeling/store-file-format`, `modeling/testing` |
| Change a model already in production | `modeling/migrating/overview` |
| Plan adoption and data ownership | `best-practices/adoption-patterns`, `best-practices/source-of-truth` |
| AI agents, RAG, MCP servers | `use-cases/overview` |
| Learn from production adopters | `adopters/overview` |
| HTTP API reference | `api/service/...` (see `docs-api-reference`) |

### Rules

- Prefer the docs over memory for anything version-sensitive: configuration flags and defaults, experimental features, SDK method names, and API limits.
- Docs examples use readable identifiers like `user:anne`. In production, never put personal data in tuple identifiers (see `getting-started/tuples-api-best-practices`).
- Quote only the parts of a page you need; do not paste whole pages into the conversation.
- If the docs and this skill disagree on API behavior, the docs and the OpenAPI spec win (see `docs-openapi-validation`).
