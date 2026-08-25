# Generated Configuration and Agent-Readable Documentation

## Configuration page

`docs/content/getting-started/setup-openfga/configuration.mdx` is generated output.

The chain is:

1. `scripts/update-config-page.mjs` queries the latest `openfga/openfga` release.
2. It downloads that release's `.config-schema.json`.
3. It renders the complete MDX page.
4. `npm run build:config-page` writes the tracked MDX output.
5. `.github/workflows/update-docs.yml` runs nightly and opens or updates a generated-doc PR when output changes.

Rules:

- Never hand-edit the generated MDX page.
- Change option names, descriptions, types, defaults, or environment mappings in the upstream OpenFGA schema and release process.
- Change page framing or rendering in `scripts/update-config-page.mjs`.
- Run `npm run build:config-page`, review the whole generated diff, and keep generator and output changes together when appropriate.
- A normal `npm run build` also runs this generator. Inspect the working tree after every build and isolate unrelated release drift.

## Agent-readable production output

The Docusaurus llms plugin in `docusaurus.config.js` generates Markdown representations for current docs pages. Production output includes:

- `/llms.txt`: curated starting points, FAQs and concepts, API links, and discovery links;
- `/docs/llms.txt`: exhaustive index of current documentation Markdown pages;
- `/llms-full.txt`: optional single-file bundle;
- an adjacent Markdown representation for each docs route, such as `/docs/fga.md`.

These are files under `build/`, not authored sources.

## Build pipeline

`npm run build` executes these stages in order:

1. `build:config-page` runs `scripts/update-config-page.mjs`.
2. `build:docusaurus` builds HTML and plugin-generated Markdown.
3. `build:agent-content` runs `scripts/prepare-agent-content.mjs`.
4. `check:agent-content` runs `scripts/validate-agent-content.mjs`.

`scripts/prepare-agent-content.mjs`:

- adds title, description, canonical URL, content type, and update metadata to generated Markdown;
- curates `START_HERE_PATHS`, `FAQ_PATHS`, and `API_PATHS`;
- rewrites root and docs indexes;
- links the machine-readable OpenAPI specification;
- honors `BASE_URL`, including PR preview paths.

If a curated page is renamed or removed, update the corresponding list in this script. New ordinary docs pages enter the exhaustive docs index automatically.

`scripts/clean-agent-markdown.mjs` removes framework-only noise and improves semantic output from known visual components. Update it when a new component leaks implementation markup or loses essential semantics.

## Validation guarantees

`scripts/validate-agent-content.mjs` checks, among other things:

- required root and docs index sections;
- the configured OpenAPI link;
- existence and exact index coverage of generated Markdown pages;
- frontmatter metadata on every generated Markdown page;
- preservation of expected FAQ headings;
- absence of generic navigation text and leaked framework markup;
- HTML `rel="alternate"` links to Markdown;
- HTML `rel="describedby"` links to an index;
- the API page's `rel="service-desc"` link to the OpenAPI JSON.

Do not weaken an assertion merely to make a build pass. Fix the authored page, component semantics, conversion hook, curated route, or API metadata that violates the contract.

## Content design for both formats

- Put essential setup and expected results in prose, not only inside an interactive component.
- Check the generated `.md` page when adding complex MDX, cards, tabs, or custom React.
- Use descriptive link text and semantic headings.
- Keep page routes stable so adjacent `.md` links and curated indexes remain stable.
- Run a full build for any documentation change; the development server does not prove agent-readable output is correct.
