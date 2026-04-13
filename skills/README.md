# Skills

Each folder in this directory is a **skill pack**. Adding a folder with a `manifest.yaml` automatically makes it installable via:

```bash
npx @h1dr0n/skill-pool install <folder-name>
```

No additional registration or configuration needed.

## Directory Structure

```
skills/
  my-pack/
    manifest.yaml          # required - pack metadata
    rules/                 # optional - always-active coding standards
      coding-style.md
    skills/                # optional - domain knowledge & workflows
      my-skill.md          #   single-file skill
      my-complex-skill/    #   multi-file skill (must have SKILL.md)
        SKILL.md
        sub-topic.md
    agents/                # optional - AI agent personas
      my-agent.md
```

## manifest.yaml

```yaml
name: my-pack                    # required - must match folder name
version: 1.0.0                   # semver
description: Short description   # shown in `skill-pool list`
type: universal                  # universal | claude | cursor | windsurf | antigravity
depends:                         # other packs installed automatically
  - common
tags:                            # for search/filtering
  - web
  - react
rules:                           # at least one of: rules, skills, agents
  - rules/coding-style.md
skills:
  - skills/my-skill.md
  - skills/my-complex-skill
agents:
  - agents/my-agent.md
```

### type field

| Value | Meaning |
|-------|---------|
| `universal` | (default) Adapters auto-format for each AI tool |
| `claude` | Only installable on Claude Code |
| `cursor` | Only installable on Cursor |
| `windsurf` | Only installable on Windsurf |
| `antigravity` | Only installable on Antigravity |

Use `universal` unless your content uses tool-specific features that can't be converted.

## Content Format

### Rules (rules/*.md)

Short, always-active coding standards. Keep under 50 lines. No YAML frontmatter needed - adapters add tool-specific headers automatically.

```markdown
# Rule Title

- Do this
- Don't do that
- Follow this pattern
```

### Skills (skills/*.md)

Longer domain knowledge, workflows, or checklists. Use YAML frontmatter:

```markdown
---
name: my-skill
description: One-line description used by AI to decide relevance
priority: normal
---

# Skill Title

## When to Activate
- trigger conditions

## Content
- detailed guidance
```

### Multi-file Skills (skills/my-skill/)

For complex skills that need multiple files. Must have a `SKILL.md` entry point:

```
skills/my-skill/
  SKILL.md           # entry point
  sub-topic-1.md     # referenced from SKILL.md
  sub-topic-2.md
```

### Agents (agents/*.md)

AI agent personas with specific roles and instructions:

```markdown
# Agent Name

## Role
What this agent does

## Instructions
How it should behave

## Tools
What tools it can use
```

## Quick Start

1. Create a folder: `skills/my-pack/`
2. Add `manifest.yaml` with at least `name` and one content reference
3. Add your `.md` files in `rules/`, `skills/`, or `agents/`
4. Test: `npx @h1dr0n/skill-pool install my-pack`

See `skills/common/` for a working example.
