# Contributing

## Adding a New Skill Pack

1. Create a folder under `skills/`:

```bash
mkdir -p skills/my-pack/skills
```

2. Add a `manifest.yaml`:

```yaml
name: my-pack
version: 1.0.0
description: What this pack does
type: universal
depends: []
tags:
  - relevant-tag
skills:
  - skills/my-skill.md
```

3. Add your content files (rules, skills, agents).

4. Test locally:

```bash
node bin/cli.js list                      # should show your pack
node bin/cli.js install my-pack           # install into a test project
```

That's it. No registration, no config changes. The folder name = the pack name.

## Content Guidelines

### Rules (rules/*.md)

Short, always-active standards. Keep under 50 lines. No YAML frontmatter needed.

```markdown
# Rule Title

- Do this
- Don't do that
```

### Skills (skills/*.md)

Longer domain knowledge. Use YAML frontmatter:

```markdown
---
name: my-skill
description: One-line description for AI to judge relevance
priority: normal
---

# Skill Title

## When to Activate
- trigger conditions

## Content
- guidance
```

### Multi-file Skills (skills/my-skill/)

For complex topics. Must have a `SKILL.md` entry point:

```
skills/my-skill/
  SKILL.md
  sub-topic.md
```

### Agents (agents/*.md)

AI agent personas:

```markdown
# Agent Name

## Role
What this agent does

## Instructions
How it should behave
```

## manifest.yaml Reference

| Field | Required | Description |
|-------|----------|-------------|
| `name` | yes | Must match folder name |
| `version` | yes | Semver (e.g. 1.0.0) |
| `description` | yes | Shown in `skill-pool list` |
| `type` | no | `universal` (default), `claude`, `cursor`, `windsurf`, `antigravity` |
| `depends` | no | Array of pack names installed automatically |
| `tags` | no | For search/filtering |
| `rules` | * | Paths to rule files |
| `skills` | * | Paths to skill files or directories |
| `agents` | * | Paths to agent files |

\* At least one of `rules`, `skills`, or `agents` is required.

## Type Field

- `universal` - content works on all AI tools, adapters auto-format
- `claude` / `cursor` / `windsurf` / `antigravity` - locked to one tool (use when content relies on tool-specific features)

## Testing

```bash
npm test                                  # run all tests
npx vitest run tests/core/manifest.test.js  # run specific test
```

## Publishing

After adding packs, bump the patch version in `package.json` and publish:

```bash
npm publish --access public
```
