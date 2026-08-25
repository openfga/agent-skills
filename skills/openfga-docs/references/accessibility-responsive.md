# Accessibility and Responsive Presentation

## Semantic content first

- Use headings in order and make each heading describe the following section.
- Use real lists for sequences and sets, real tables for tabular relationships, and code blocks for code.
- Give links specific text; avoid "here", "this", and raw URLs as the only label.
- Give informative images concise alt text. Use empty alt text only for truly decorative images.
- Explain diagrams in nearby prose so the information is available without sight or image loading.
- Do not communicate state or meaning through color, shape, position, or animation alone.

## Interactive MDX and React

Reuse Docusaurus primitives and components from `src/components/Docs/` before adding a custom interaction.

For a new or changed interaction:

- use native links and buttons for their intended behavior;
- ensure every control has an accessible name;
- preserve a visible `:focus-visible` state;
- support keyboard activation and logical focus order;
- expose expanded, selected, loading, and error states semantically;
- do not require hover to reveal essential controls or content;
- keep important instructions outside a tab or component that may not appear in generated Markdown;
- avoid server-rendering failures by following existing `BrowserOnly` patterns when browser APIs are required.

Run `npm run typecheck` for TSX changes. Avoid weakening types or casting component props merely to satisfy MDX.

## Responsive layout

The site uses Docusaurus/Infima breakpoints and local CSS modules. Existing global styles include mobile behavior around `996px`, but each component must work across its actual content widths.

Check at least:

- a narrow phone viewport around 320-375 CSS pixels;
- a tablet or narrow docs layout around 768 CSS pixels;
- a desktop viewport at 1280 CSS pixels or wider.

Verify:

- no horizontal page overflow;
- code blocks and wide tables scroll or wrap without obscuring content;
- grids collapse without changing reading order;
- navigation, tabs, and copy controls remain reachable;
- text is readable without zoom and tap targets are not crowded;
- fixed or absolute elements do not cover search, headings, or content.

Prefer component-scoped `*.module.css`. If a global override is required, constrain its selector to the owning feature and test the docs page, homepage, and API explorer surfaces it could affect.

## Visual and motion quality

- Preserve sufficient text, link, border, and focus contrast in the site's active color mode.
- Respect reduced-motion preferences for nonessential animation.
- Avoid screenshots for text or commands that should be selectable and agent-readable.
- Use repository-managed assets and Git LFS conventions for tracked media types.
- Keep images sized to avoid layout shift and responsive enough not to overflow.

## Preview checks

Use the development server for quick iteration, then inspect the production build or PR preview. Test keyboard navigation, zoom, narrow layout, visible focus, image alternatives, and the generated adjacent Markdown page for any complex MDX.
