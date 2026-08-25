# Links, Navigation, Redirects, Anchors, and API References

## Sidebar and navbar

- `docs/sidebars.js` is the explicit documentation hierarchy.
- A page does not become discoverable merely because its MDX file exists.
- Put a new page in the category matching its reader task and intended sequence.
- Category landing pages use `link: {type: 'doc', id: ...}`; follow the neighboring structure.
- Global navbar items live in `docusaurus.config.js`.
- `docs/README.md` is excluded from the docs build and is not a substitute for sidebar work.

When moving a page, update the sidebar, related links, curated agent routes, and any contributor inventory that intentionally lists it.

## Links

- Use relative links for nearby authored MDX, following the local convention such as `./setup-sdk-client.mdx`.
- Use root-relative site routes for public cross-section links, such as `/api/service`.
- Use descriptive link text that still makes sense in generated Markdown.
- Do not add an entry to the link-check ignore list simply because a link is inconvenient to validate.
- Prefer a stable canonical source over a search result, mutable branch view, or copied payload.

The Docusaurus config throws on broken rendered links. It warns on broken Markdown links, while CI separately runs `github-action-markdown-link-check` for both `.md` and `.mdx` using `.github/workflows/markdown.links.config.json`.

## Anchors

Docusaurus derives heading anchors from heading text. Before changing a public heading:

1. search for links to the existing fragment;
2. decide whether the heading can remain stable;
3. update all internal references if it must change;
4. verify the built route and generated Markdown.

Use explicit HTML IDs only when a stable public fragment cannot be preserved through the heading and the local MDX pattern supports it.

Swagger UI uses `deepLinking`. Existing API links use encoded fragments such as:

```text
/api/service#Relationship%20Queries/Check
```

Verify Swagger fragments against the rendered API explorer; do not infer them from an operation name alone.

## Redirects

Public route redirects are configured with `@docusaurus/plugin-client-redirects` in `docusaurus.config.js`.

Add a redirect when:

- a published page slug changes;
- pages are consolidated;
- a global entry point moves.

Redirect the old route to the single best replacement. Avoid chains and loops. Build after adding it because redirect generation and route collisions are production-build concerns.

## Swagger and OpenAPI boundaries

The API explorer is composed from:

- `src/pages/api/service.tsx`;
- `src/components/SwaggerUI/swagger-ui.tsx`;
- Swagger override CSS in the same component directory;
- `customFields.apiDocsBasePath` in `docusaurus.config.js`.

The default OpenAPI source is:

```text
https://raw.githubusercontent.com/openfga/api/main/docs/openapiv2/apidocs.swagger.json
```

`API_DOCS_PATH` can override it for builds and previews.

Use the OpenAPI document for exact HTTP paths, request fields, response fields, and operation names. Use authored docs to teach tasks, concepts, and recommended sequencing. Do not manually reproduce the complete API schema in MDX.

The API page advertises the OpenAPI JSON as a machine-readable service description, and the root `llms.txt` links it directly. Changes to the explorer or API source must preserve both discovery paths and pass `check:agent-content`.
