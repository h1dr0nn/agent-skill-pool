import path from 'node:path';
import chalk from 'chalk';
import { ensureDir, writeFileAtomic, fileExists } from '../utils/fs.js';

const MANIFEST_TEMPLATE = (name) => `name: ${name}
version: 0.1.0
description: "${name} skill pack"
depends:
  - common
tags:
  - ${name}
rules: []
skills:
  - skills/example.md
agents:
  - agents/example.md
`;

const SKILL_TEMPLATE = `---
name: example
description: Example skill - replace with your skill description. Use when...
---

# Example Skill

## When to Activate
- Describe when this skill should be used

## Content
- Add your skill content here
`;

const AGENT_TEMPLATE = `---
name: example-agent
description: Example agent - replace with your agent description
tools: ["Read", "Write", "Edit", "Glob", "Grep"]
model: sonnet
---

You are an expert in...

## Core Mission
- Describe what this agent does

## Rules
- Add agent-specific rules
`;

const README_TEMPLATE = (name) => `# ${name}

A skill pack for agent-skill-pool.

## Structure

\`\`\`
${name}/
├── manifest.yaml   # Pack metadata, dependencies, and file listings
├── rules/          # Rule files (.md) installed to AI tool config
├── skills/         # Skill files (.md) with frontmatter metadata
├── agents/         # Agent files (.md) with frontmatter metadata
└── README.md       # This file
\`\`\`

## manifest.yaml

The manifest defines the pack name, version, description, dependencies,
tags, and lists all rules, skills, and agents included in the pack.

## File Format

### Skills

Skills use YAML frontmatter with \`name\` and \`description\` fields,
followed by markdown content describing when and how to use the skill.

### Agents

Agents use YAML frontmatter with \`name\`, \`description\`, \`tools\`,
and \`model\` fields, followed by a system prompt in markdown.

### Rules

Rules are plain markdown files installed into the AI tool's
configuration directory.

## Getting Started

1. Edit \`manifest.yaml\` with your pack details
2. Add rules to \`rules/\`
3. Edit or add skills in \`skills/\`
4. Edit or add agents in \`agents/\`
5. Install with: \`skill-pool install ${name}\`
`;

export async function createCommand(name, options) {
  const baseDir = path.resolve(options.path);
  const packDir = path.join(baseDir, name);

  if (await fileExists(packDir)) {
    throw new Error(`Directory already exists: ${packDir}`);
  }

  await ensureDir(path.join(packDir, 'rules'));
  await writeFileAtomic(path.join(packDir, 'manifest.yaml'), MANIFEST_TEMPLATE(name));
  await writeFileAtomic(path.join(packDir, 'skills', 'example.md'), SKILL_TEMPLATE);
  await writeFileAtomic(path.join(packDir, 'agents', 'example.md'), AGENT_TEMPLATE);
  await writeFileAtomic(path.join(packDir, 'README.md'), README_TEMPLATE(name));

  console.log(chalk.green(`\nCreated skill pack "${name}" at ${packDir}\n`));
  console.log(chalk.bold('Structure:\n'));
  console.log(`  ${chalk.cyan(name)}/`);
  console.log(`  ├── manifest.yaml`);
  console.log(`  ├── rules/`);
  console.log(`  ├── skills/`);
  console.log(`  │   └── example.md`);
  console.log(`  ├── agents/`);
  console.log(`  │   └── example.md`);
  console.log(`  └── README.md`);
  console.log('');
  console.log(chalk.bold('Next steps:\n'));
  console.log(`  1. Edit ${chalk.cyan('manifest.yaml')} with your pack details`);
  console.log(`  2. Add rules to ${chalk.cyan('rules/')}`);
  console.log(`  3. Edit or add skills in ${chalk.cyan('skills/')}`);
  console.log(`  4. Edit or add agents in ${chalk.cyan('agents/')}`);
  console.log(`  5. Install with: ${chalk.cyan(`skill-pool install ${name}`)}`);
  console.log('');
}
