# Content Authoring

## Start with a reader contract

Before editing, write down:

- who the reader is;
- what they are trying to accomplish or understand;
- what they must already have;
- what observable result confirms success.

Choose one dominant page intent:

| Intent | Structure |
| --- | --- |
| Tutorial | prerequisites, sequential steps, checkpoints, final working result |
| How-to | goal, minimal prerequisites, task steps, verification, troubleshooting |
| Reference | concise definitions, syntax or tables, exact constraints, cross-links |
| Explanation | concept, context, tradeoffs, examples, related concepts |

Do not turn a task page into a glossary or an explanation page into a long setup tutorial.

## Match local MDX

- Read the target page and two nearby pages before changing structure or imports.
- Use frontmatter `title` and `description`. Preserve `slug`, `toc_max_heading_level`, and other fields unless the change requires them.
- Use one descriptive H1 and a logical heading hierarchy. Avoid skipping levels.
- Put imports after frontmatter and group them like neighboring pages.
- Reuse exports from `@components/Docs` and Docusaurus theme components.
- Use admonitions only for material that is genuinely a note, warning, or prerequisite.
- Keep steps actionable and put commands immediately after the sentence that introduces them.
- Give every code block an accurate language identifier.
- Do not hide essential facts only inside tabs, diagrams, or interactive components.

## OpenFGA terminology

Use product terms precisely:

- **OpenFGA** is the product name.
- A **store** contains authorization models and relationship tuples.
- An **authorization model** defines types, relations, and how relations are computed.
- A **type** classifies users or objects, such as `user`, `organization`, or `document`.
- A **relation** describes a possible relationship or computed permission on an object type.
- A **relationship tuple** is a fact in `user relation object` form, such as `user:anne member organization:acme`.
- A **userset** refers to users related through another object and relation, such as `group:engineering#member`.
- A **condition** constrains a relationship using typed context.
- An **authorization model ID** identifies an immutable model version.

Use `user:<id>` and `object-type:<id>` consistently. Do not alternate between a bare ID and a fully qualified identifier within one flow. Distinguish an API user string from a human user, and do not call every relation a role.

## Explain examples as systems

Every nontrivial example should keep these parts aligned:

1. authorization model;
2. relationship tuples;
3. query;
4. expected result.

State why the result follows from the model. If an example uses a specific authorization model ID in production guidance, show where it comes from and keep it consistent.

Use [openfga-examples.md](openfga-examples.md) as a tested baseline, then adapt names to the page. For larger model-design work, verify behavior with the current FGA CLI rather than reasoning from prose alone.

## Keep content durable

- Link to the OpenAPI specification for full field definitions instead of duplicating the schema.
- Link to focused concept pages instead of restating whole sections.
- Avoid hard-coding release numbers, dependency versions, defaults, or limits unless the page is explicitly versioned or the value is verified at authoring time.
- When a fact comes from another OpenFGA repository, identify that upstream source in the PR.
- Prefer current source files and commands over screenshots of terminal or API output.

## Write for generated Markdown too

The production build creates a Markdown page beside every current docs URL. Important meaning must survive without client-side React:

- introduce tabs and interactive examples with complete prose;
- give custom components semantic output;
- avoid generic link text such as "click here";
- keep headings and table headers meaningful outside the visual layout;
- do not make color, position, or an icon the only carrier of meaning.
