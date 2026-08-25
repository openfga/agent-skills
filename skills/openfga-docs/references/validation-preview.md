# Validation, Links, and Previews

## Install consistently

GitHub Actions uses Node.js 22 and:

```bash
npm ci
```

Use `npm ci` when validating a clean checkout. Keep `package-lock.json` synchronized only when dependencies intentionally change.

## Existing validation commands

Run the repository's exact npm checks:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
```

Notes:

- `format:check` currently checks `src/**`; it is not proof that MDX prose is well formatted.
- `lint` covers the repository's ESLint configuration.
- `typecheck` runs TypeScript checking.
- `build` runs configuration generation, Docusaurus production build, agent-content preparation, and agent-content validation.
- CI also checks circular imports with `npx madge --circular . --extensions ts,js,jsx,tsx`.
- `make check-all` mirrors the main local checks and includes the circular-import check, but the npm commands above are the canonical scripts requested by CI.

Run all four commands for a complete docs change. A targeted command may speed iteration but does not replace the final build.

## Link expectations

The production build uses:

- `onBrokenLinks: 'throw'`;
- `onBrokenMarkdownLinks: 'warn'`.

Pull request CI separately checks `.md` and `.mdx` files with `github-action-markdown-link-check` and `.github/workflows/markdown.links.config.json`. There is no dedicated npm link-check script.

For a targeted local external-link check, use the installed package:

```bash
npx markdown-link-check \
  --quiet \
  --config .github/workflows/markdown.links.config.json \
  docs/content/path/to/changed-page.mdx
```

The config intentionally ignores root-relative and relative links because Docusaurus validates rendered internal routes. Never treat that ignore behavior as proof an internal link or anchor works: confirm it in `npm run build` and the rendered page.

## Local preview

For fast authoring:

```bash
npm run dev
```

The development server defaults to port 3000. It is useful for content and component iteration, but it does not prove production generation succeeds.

After a build:

```bash
npm run serve
```

Inspect the changed page, its sidebar location, related links, narrow and wide layouts, keyboard behavior, and any Swagger anchor. For agent-readable output, also inspect:

```text
http://localhost:3000/llms.txt
http://localhost:3000/docs/llms.txt
http://localhost:3000/llms-full.txt
http://localhost:3000/docs/<route>.md
```

## Generated-diff check

Because `npm run build` regenerates the tracked configuration page from the latest release, check:

```bash
git status --short
git diff -- docs/content/getting-started/setup-openfga/configuration.mdx
```

If it changed for reasons unrelated to the task, do not silently include release drift in the PR. Keep the generated update isolated and never repair it by editing generated rows.

## Pull request preview

`.github/workflows/preview.yml` builds non-draft, same-repository pull requests with:

```bash
BASE_URL=/pr-preview/pr-<number> npm run build
```

The deployed preview is:

```text
https://openfga.dev/pr-preview/pr-<number>/
```

A docs route is available beneath that base, for example:

```text
https://openfga.dev/pr-preview/pr-<number>/docs/modeling/getting-started
```

The workflow does not deploy draft PRs, Dependabot PRs, or pull requests whose head repository differs from `openfga/openfga.dev`. Use local production preview when those conditions apply.

Before approval, inspect the PR preview rather than only the development server. Base-path bugs, generated agent links, redirects, and production-only route failures can appear there.
