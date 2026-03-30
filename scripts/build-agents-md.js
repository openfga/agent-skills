#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const SKILLS_DIR = path.join(__dirname, '..', 'skills', 'openfga');
const RULES_DIR = path.join(SKILLS_DIR, 'references');
const SKILL_FILE = path.join(SKILLS_DIR, 'SKILL.md');
const OUTPUT_FILE = path.join(SKILLS_DIR, 'AGENTS.md');

// Section intro descriptions
const SECTION_INTROS = {
  'core': 'Understanding core concepts is fundamental to creating correct and maintainable authorization models.',
  'relation': 'The building blocks for expressing authorization logic in OpenFGA.',
  'design': 'Design patterns that lead to maintainable and correct authorization models.',
  'test': 'Thorough testing ensures your authorization model behaves as expected.',
  'roles': 'Implement user-defined roles when applications need flexible permission structures.',
  'optimize': 'Optimize your models for clarity and efficiency.',
  'sdk': 'SDK implementations for integrating OpenFGA into your applications.',
  'workflow': 'Essential workflow practices for working with OpenFGA models.',
};

/**
 * Parse SKILL.md to extract section order and rule order from the Rule Index tables.
 * Each table section has a ### heading followed by a markdown table with
 * `references/<name>.md` file paths and descriptions.
 */
function parseSkillFile() {
  const content = fs.readFileSync(SKILL_FILE, 'utf8');

  const sections = {};
  const ruleOrder = {};

  // Match each ### heading followed by a markdown table inside ## Rule Index
  const sectionRegex = /### ([^\n]+)\n\| File \| Description \|\n\|[^\n]+\|\n((?:\| [^\n]+\|\n?)+)/g;
  let match;
  let order = 0;

  while ((match = sectionRegex.exec(content)) !== null) {
    order++;
    const title = match[1].trim();
    const tableBody = match[2];

    // Extract rule filenames from table rows: | `references/<name>.md` | description |
    const rowRegex = /\| `references\/([^`]+)\.md` \|/g;
    const rules = [];
    let rowMatch;

    while ((rowMatch = rowRegex.exec(tableBody)) !== null) {
      rules.push(rowMatch[1]); // e.g., "core-types"
    }

    // Determine the prefix from the first rule
    if (rules.length > 0) {
      const prefix = rules[0].split('-')[0];
      sections[prefix] = { order, title };
      ruleOrder[prefix] = rules;
    }
  }

  return { sections, ruleOrder };
}

/**
 * Parse YAML frontmatter from markdown content
 */
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { metadata: {}, content };
  }

  const yamlContent = match[1];
  const bodyContent = match[2];

  // Simple YAML parser for our use case
  const metadata = {};
  const lines = yamlContent.split('\n');

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      metadata[key] = value;
    }
  }

  return { metadata, content: bodyContent };
}

/**
 * Get section prefix from filename
 */
function getSectionPrefix(filename) {
  const parts = filename.replace('.md', '').split('-');
  return parts[0];
}

/**
 * Get rule name from filename (without extension)
 */
function getRuleName(filename) {
  return filename.replace('.md', '');
}

/**
 * Read and parse all rule files
 */
function readRules() {
  const files = fs.readdirSync(RULES_DIR)
    .filter(f => f.endsWith('.md'));

  const rules = [];

  for (const file of files) {
    const filePath = path.join(RULES_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { metadata, content: body } = parseFrontmatter(content);

    const sectionPrefix = getSectionPrefix(file);
    const ruleName = getRuleName(file);

    rules.push({
      filename: file,
      ruleName,
      sectionPrefix,
      title: metadata.title || file.replace('.md', ''),
      content: body.trim(),
    });
  }

  return rules;
}

/**
 * Group rules by section, ordered according to SKILL.md.
 * Uses ruleOrder to assign rules to the correct section even when the
 * filename prefix differs from the section prefix (e.g. workflow-validate
 * listed under the "test" section).
 */
function groupRulesBySection(rules, ruleOrder) {
  // Build a reverse map: ruleName -> section prefix from SKILL.md
  const ruleToSection = {};
  for (const [prefix, ruleNames] of Object.entries(ruleOrder)) {
    for (const name of ruleNames) {
      ruleToSection[name] = prefix;
    }
  }

  const grouped = {};

  for (const rule of rules) {
    // Prefer the section assignment from SKILL.md, fall back to filename prefix
    const prefix = ruleToSection[rule.ruleName] || rule.sectionPrefix;
    if (!grouped[prefix]) {
      grouped[prefix] = [];
    }
    grouped[prefix].push(rule);
  }

  // Sort rules within each section according to ruleOrder from SKILL.md
  for (const [prefix, sectionRules] of Object.entries(grouped)) {
    const order = ruleOrder[prefix] || [];

    grouped[prefix] = sectionRules.sort((a, b) => {
      const aIndex = order.indexOf(a.ruleName);
      const bIndex = order.indexOf(b.ruleName);

      // If both are in the order list, sort by that order
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      // If only a is in the list, it comes first
      if (aIndex !== -1) return -1;
      // If only b is in the list, it comes first
      if (bIndex !== -1) return 1;
      // If neither, sort alphabetically
      return a.ruleName.localeCompare(b.ruleName);
    });
  }

  return grouped;
}

/**
 * Generate a slug from title for anchor links
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

/**
 * Generate table of contents
 */
function generateTOC(groupedRules, sections) {
  const lines = [];

  const sortedSections = Object.keys(groupedRules)
    .filter(prefix => sections[prefix])
    .sort((a, b) => sections[a].order - sections[b].order);

  for (const prefix of sortedSections) {
    const section = sections[prefix];
    const sectionNum = section.order;
    const rules = groupedRules[prefix];

    lines.push(`${sectionNum}. [${section.title}](#${sectionNum}-${slugify(section.title)})`);

    rules.forEach((rule, idx) => {
      const subNum = `${sectionNum}.${idx + 1}`;
      lines.push(`   - ${subNum} [${rule.title}](#${subNum.replace('.', '')}-${slugify(rule.title)})`);
    });
  }

  return lines.join('\n');
}

/**
 * Generate section content
 */
function generateSectionContent(sectionNum, section, rules, prefix) {
  const lines = [];

  lines.push(`## ${sectionNum}. ${section.title}`);
  lines.push('');

  if (SECTION_INTROS[prefix]) {
    lines.push(SECTION_INTROS[prefix]);
    lines.push('');
  }

  rules.forEach((rule, idx) => {
    const subNum = `${sectionNum}.${idx + 1}`;

    lines.push(`### ${subNum} ${rule.title}`);
    lines.push('');

    // Process content - remove the first heading if it duplicates the title
    let content = rule.content;
    const headingMatch = content.match(/^##\s+.+\n+/);
    if (headingMatch) {
      content = content.replace(headingMatch[0], '');
    }

    lines.push(content);
    lines.push('');
  });

  lines.push('---');
  lines.push('');

  return lines.join('\n');
}

/**
 * Generate the full AGENTS.md content
 */
function generateAgentsMD(rules, sections, ruleOrder) {
  const groupedRules = groupRulesBySection(rules, ruleOrder);

  const header = `# OpenFGA Best Practices

**Version 1.0.0**
OpenFGA Community
${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}

> **Note:**
> This document is mainly for agents and LLMs to follow when authoring,
> generating, or refactoring OpenFGA authorization models. Humans
> may also find it useful, but guidance here is optimized for automation
> and consistency by AI-assisted workflows.

---

## Abstract

Comprehensive guide for authoring OpenFGA authorization models, designed for AI agents and LLMs. Covers core concepts, relationship patterns, testing methodologies, custom roles, and model optimization. Each section includes detailed explanations, real-world examples comparing incorrect vs. correct implementations, and specific guidance to ensure correct authorization modeling.

---

## Table of Contents

${generateTOC(groupedRules, sections)}

---

`;

  const sectionContents = [];

  const sortedSections = Object.keys(groupedRules)
    .filter(prefix => sections[prefix])
    .sort((a, b) => sections[a].order - sections[b].order);

  for (const prefix of sortedSections) {
    const section = sections[prefix];
    const sectionRules = groupedRules[prefix];
    sectionContents.push(generateSectionContent(section.order, section, sectionRules, prefix));
  }

  const references = `## References

1. [OpenFGA Documentation](https://openfga.dev/docs)
2. [OpenFGA DSL Reference](https://openfga.dev/docs/configuration-language)
3. [OpenFGA CLI](https://github.com/openfga/cli)
4. [OpenFGA Sample Stores](https://github.com/openfga/sample-stores)
5. [Google Zanzibar Paper](https://research.google/pubs/pub48190/)
`;

  return header + sectionContents.join('') + references;
}

/**
 * Main function
 */
function main() {
  console.log('Reading SKILL.md from:', SKILL_FILE);
  const { sections, ruleOrder } = parseSkillFile();

  console.log('\nSection order from SKILL.md:');
  Object.entries(sections)
    .sort((a, b) => a[1].order - b[1].order)
    .forEach(([prefix, section]) => {
      console.log(`  ${section.order}. ${prefix} -> ${section.title}`);
    });

  console.log('\nRule order from SKILL.md:');
  for (const [prefix, rules] of Object.entries(ruleOrder)) {
    console.log(`  ${prefix}: ${rules.join(', ')}`);
  }

  console.log('\nReading rules from:', RULES_DIR);
  const rules = readRules();
  console.log(`Found ${rules.length} rule files`);

  const groupedRules = groupRulesBySection(rules, ruleOrder);
  const sectionCounts = Object.entries(groupedRules)
    .sort((a, b) => (sections[a[0]]?.order || 99) - (sections[b[0]]?.order || 99))
    .map(([prefix, rules]) => `  ${prefix}: ${rules.length} rules`)
    .join('\n');
  console.log('Rules by section:\n' + sectionCounts);

  const content = generateAgentsMD(rules, sections, ruleOrder);

  fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
  console.log('\nGenerated:', OUTPUT_FILE);
  console.log(`Total size: ${(content.length / 1024).toFixed(1)} KB`);
}

main();
