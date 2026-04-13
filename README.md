# Agent Skill Pool

CLI tool to install AI coding skills per-project. Only what you need, nothing more.

## Problem

Installing too many skills globally causes:

1. **Context dilution** - AI reads all rules/skills, including irrelevant ones.
2. **Conflicts** - Skill A says "do this", skill B says "do the opposite".
3. **Slow startup** - AI processes thousands of instruction lines before doing actual work.
4. **Manual setup** - Every new project requires copy-pasting rules.

## Quick Start

```bash
# No install needed - just run with npx
npx @h1dr0n/skill-pool install common

# Or install globally
npm install -g @h1dr0n/skill-pool
skill-pool install common
```

## How It Works

### One source, multiple targets

Each AI coding tool has its own format:

| Tool | Config location | Format |
|------|----------------|--------|
| Claude Code | `.claude/rules/`, `.claude/skills/`, `.claude/agents/` | Markdown |
| Cursor | `.cursor/rules/*.mdc`, `.cursor/skills/` | MDC (markdown + YAML frontmatter) |
| Windsurf | `.windsurf/rules/`, `.windsurf/skills/` | Markdown |
| Antigravity | `.agent/rules/`, `.agent/skills/`, `.agent/agents/` | Markdown |

skill-pool stores content once in a universal format, then adapters convert it for each tool.

### Auto-detect targets

The CLI scans the project directory:
- `.claude/` found -> install for Claude Code
- `.cursor/` found -> install for Cursor
- `.windsurf/` found -> install for Windsurf
- `.agent/` found -> install for Antigravity
- Nothing found -> defaults to Claude Code

Or specify manually: `skill-pool install common --target claude,cursor`

## Available Packs

| Pack | Description |
|------|-------------|
| `common` | Skill feedback reporter, Karpathy guidelines |

Want more? Add your own pack - see [Contributing](#contributing).

## CLI Commands

### Install and Remove

```bash
skill-pool install <packs...>                    # install into current project
skill-pool install <packs...> --target claude,cursor
skill-pool remove <pack>                         # remove one pack
skill-pool remove --all                          # remove everything
```

### Info and Discovery

```bash
skill-pool list                                  # list all available packs
skill-pool list --installed                      # list installed packs
skill-pool info <pack>                           # show pack details
skill-pool diff <pack>                           # compare installed vs latest
skill-pool targets                               # show supported AI tools
```

### Project Setup

```bash
skill-pool init                                  # auto-detect and suggest packs
skill-pool update                                # update all installed packs
skill-pool update <pack>                         # update one pack
```

### Ecosystem

```bash
skill-pool add <github-url>                      # install from GitHub repo
skill-pool create <name>                         # scaffold a new pack
```

## Pack Structure

Each pack is a folder under `skills/` with a `manifest.yaml`:

```
skills/my-pack/
  manifest.yaml          # required
  rules/                 # always-active coding standards
    my-rule.md
  skills/                # domain knowledge & workflows
    my-skill.md          # single-file skill
    complex-skill/       # multi-file skill
      SKILL.md
      sub-topic.md
  agents/                # AI agent personas
    my-agent.md
```

### manifest.yaml

```yaml
name: my-pack
version: 1.0.0
description: Short description
type: universal              # universal | claude | cursor | windsurf | antigravity
depends:
  - common
tags:
  - web
rules:
  - rules/my-rule.md
skills:
  - skills/my-skill.md
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

### Content types

| Type | Purpose | Size |
|------|---------|------|
| Rules | Always-active coding standards | 20-50 lines |
| Skills | Domain knowledge, workflows, checklists | 100-600 lines |
| Agents | Specialized AI personas with tools config | varies |

## Tracking

Every managed file includes a marker comment:

```html
<!-- skill-pool:common:1.0.0 -->
```

No tracking file needed. The CLI scans markers to know what's installed.

## Where Content Goes

| Content | Claude | Cursor | Windsurf | Antigravity |
|---------|--------|--------|----------|-------------|
| Rules | `.claude/rules/<pack>-<name>.md` | `.cursor/rules/<pack>-<name>.mdc` | `.windsurf/rules/<pack>-<name>.md` | `.agent/rules/<pack>-<name>.md` |
| Skills | `.claude/skills/<pack>-<name>/` | `.cursor/skills/<pack>-<name>/` | `.windsurf/skills/<pack>-<name>/` | `.agent/skills/<pack>-<name>/` |
| Agents | `.claude/agents/<pack>-<name>.md` | `.cursor/rules/<pack>-agent-<name>.mdc` | `.windsurf/rules/<pack>-agent-<name>.md` | `.agent/agents/<pack>-<name>.md` |

## Plugin System

Add custom adapters via `.skillpoolrc.json`:

```json
{
  "adapters": {
    "my-ide": "./my-adapter.js"
  }
}
```

Custom adapters must export: `detect`, `install`, `remove`, `list`.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to add new skill packs.

## Feedback

If a skill gives wrong advice, the `skill-feedback` skill in the `common` pack auto-creates issues at [h1dr0nn/agent-skill-pool](https://github.com/h1dr0nn/agent-skill-pool/issues).

## License

MIT
