# Repository Map and Source Boundaries

## Current stack

`openfga/openfga.dev` uses:

- Docusaurus 3 with the classic preset
- React and TypeScript for pages and components
- JavaScript configuration files
- MDX for product documentation
- npm with `package-lock.json`
- Node.js 22 in GitHub Actions

Read `package.json` for exact current versions and scripts. Do not convert file types or introduce another package manager as part of a documentation change.

## Authored sources

| Concern | Source of truth |
| --- | --- |
| Product documentation | `docs/content/**/*.mdx` |
| Documentation sidebar | `docs/sidebars.js` |
| Site, docs, navbar, redirects, and plugins | `docusaurus.config.js` |
| Docs-specific React components | `src/components/Docs/` |
| Other reusable UI | `src/components/`, `src/features/`, `src/theme/` |
| Standalone routes | `src/pages/` |
| Global and component styles | `src/css/`, `static/css/`, colocated `*.module.css` |
| Static images and icons | `static/` or page-local asset directories already used by that section |
| API explorer page | `src/pages/api/service.tsx` and `src/components/SwaggerUI/` |
| Agent-readable conversion behavior | the llms plugin settings in `docusaurus.config.js` and `scripts/*agent*.mjs` |

The docs plugin maps `docs/content/` into `/docs` and uses `docs/sidebars.js`. An explicit frontmatter `slug` controls the final path beneath `/docs`.

`docs/README.md` is excluded from the Docusaurus docs build. It is a contributor-facing inventory, not the live sidebar. Update it only when the change intentionally maintains that inventory; never treat it as navigation source.

## Generated sources and outputs

| Generated file | Generator/source | Rule |
| --- | --- | --- |
| `docs/content/getting-started/setup-openfga/configuration.mdx` | `scripts/update-config-page.mjs` using the latest released `openfga/openfga` `.config-schema.json` | Do not hand-edit. Change the upstream schema for option data or the generator for presentation, then regenerate. |
| `build/**` | `npm run build` | Never commit or hand-edit build output. |
| `build/llms.txt` | llms plugin, then `scripts/prepare-agent-content.mjs` | Change plugin config, curated route lists, or preparation code. |
| `build/docs/llms.txt` | `scripts/prepare-agent-content.mjs` | Change the preparation script. |
| `build/llms-full.txt` | llms plugin, then `scripts/prepare-agent-content.mjs` | Change the plugin or preparation script. |
| `build/docs/**/*.md` | llms plugin plus metadata preparation | Change source MDX or conversion behavior. |

The scheduled `.github/workflows/update-docs.yml` regenerates the configuration page and opens or updates a focused PR when a new OpenFGA release changes it.

## Useful local imports

`docusaurus.config.js` defines aliases such as:

- `@components` -> `src/components`
- `@features` -> `src/features`
- `@static` -> `static`

Follow imports in neighboring MDX and TSX files. Prefer an existing docs component, Docusaurus `Tabs`/`TabItem`, or Docusaurus `Link` over duplicate markup.

## Structural change checklist

When adding or moving a page:

1. Place it beside pages with the same reader task, not merely the same keyword.
2. Set a stable `slug` when the route must be explicit.
3. Add or move its entry in `docs/sidebars.js`.
4. Update related-page links and any curated agent route list.
5. Add a redirect in `docusaurus.config.js` if an existing public route changes.
6. Run a production build; development hot reload does not exercise every generated surface.
