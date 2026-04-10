# Agent Skill Pool

CLI tool to install AI coding skills per-project. Only what you need, nothing more.

## Problem

Installing too many skills globally (or locally without filtering) causes:

1. **Context dilution** - AI reads all rules/skills, including irrelevant ones. Working on Unity but AI reads React patterns, Django security, etc.
2. **Conflicts** - Skill A says "do this", skill B says "do the opposite". More skills, more conflicts.
3. **Slow startup** - AI processes thousands of instruction lines before doing actual work. Wasted tokens.
4. **Manual setup** - Every new project requires copy-pasting rules, remembering which ones apply.

## Solution

```bash
npm install -g @h1dr0n/skill-pool

cd my-unity-game
skill-pool install unity        # installs Unity/C# skills only

cd my-nextjs-app
skill-pool install web          # installs React/Next.js skills only

cd my-django-project
skill-pool install django       # installs Django + Python skills
```

## How It Works

### One source, multiple targets

Each AI coding tool has its own format:

| Tool | Config location | Format |
|------|----------------|--------|
| Claude Code | `.claude/rules/`, `.claude/skills/`, `.claude/agents/` | Markdown |
| Cursor | `.cursor/rules/*.mdc`, `.cursor/skills/` | MDC (markdown + frontmatter) |
| Windsurf | `.windsurf/rules/`, `.windsurf/skills/` | Markdown |
| Antigravity | `.agent/rules/`, `.agent/skills/`, `.agent/agents/` | Markdown |

skill-pool stores content once in a universal format, then adapters convert it for each tool.

```
skills/unity/manifest.yaml
        |
        +---> adapter/claude.js      --> .claude/rules/, .claude/skills/, .claude/agents/
        +---> adapter/cursor.js      --> .cursor/rules/, .cursor/skills/
        +---> adapter/windsurf.js    --> .windsurf/rules/, .windsurf/skills/
        +---> adapter/antigravity.js --> .agent/rules/, .agent/skills/, .agent/agents/
```

### Auto-detect targets

The CLI scans the project directory:
- `.claude/` found -> install for Claude Code
- `.cursor/` found -> install for Cursor
- `.windsurf/` found -> install for Windsurf
- `.agent/` found -> install for Antigravity
- Nothing found -> defaults to Claude Code

Or specify manually: `skill-pool install unity --target claude,cursor`

## Available Packs

### Language Packs

| Pack | Description | Dependencies |
|------|-------------|-------------|
| `common` | Coding style, security, git workflow, TDD, code review, planning | none |
| `python` | PEP 8, type hints, pytest, Django/FastAPI patterns | common |
| `go` | Idiomatic Go, testing, concurrency, code review | common |
| `rust` | Ownership, lifetimes, error handling, cargo patterns | common |
| `kotlin` | Coroutines, Kotest/MockK, Android/KMP patterns | common |
| `java` | Spring Boot, JPA/Hibernate, coding standards | common |
| `swift` | SwiftUI, concurrency, actors, protocol-based DI | common |
| `cpp` | C++ Core Guidelines, GoogleTest, CMake | common |
| `perl` | Modern Perl 5.36+, Test2, security | common |

### Framework Packs

| Pack | Description | Dependencies |
|------|-------------|-------------|
| `web` | React, Next.js, CSS, accessibility, Tailwind, E2E testing | common |
| `api` | REST design, auth, database, Docker, deployment | common |
| `django` | Django patterns, DRF, security, TDD with pytest | common, python |
| `laravel` | Laravel patterns, Eloquent, security, PHPUnit/Pest | common |
| `nestjs` | NestJS modules, controllers, providers, DTOs | common |
| `dotnet` | C#/.NET patterns, xUnit, EF Core | common |

### Domain Packs

| Pack | Description | Dependencies |
|------|-------------|-------------|
| `unity` | Unity architecture, C# patterns, ScriptableObjects | common |
| `unreal` | UE5 patterns, Blueprints, GAS, multiplayer | common, cpp |
| `mobile` | Flutter/Dart, Android clean architecture | common, kotlin, swift |
| `devops` | Deployment, Docker, E2E testing, GitHub ops | common |
| `security` | Vulnerability review, security scanning, bounty hunting | common |

### Meta-packs

Some packs automatically install their dependencies:

```
skill-pool install mobile    -> common + kotlin + swift + mobile
skill-pool install unreal    -> common + cpp + unreal
skill-pool install django    -> common + python + django
```

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
skill-pool init unity web                        # init with specific packs
skill-pool update                                # update all installed packs
skill-pool update <pack>                         # update one pack
```

### Ecosystem

```bash
skill-pool add <github-url>                      # install from GitHub repo
skill-pool create <name>                         # scaffold a new pack
```

## Pack Structure

Each pack is a directory with a manifest and content:

```
skills/unity/
  manifest.yaml
  rules/
    csharp-patterns.md
    unity-specific.md
  skills/
    unity-architecture.md        # single-file skill
    systematic-debugging.md
  agents/
    unity-architect.md
    game-designer.md
```

Skills can also be directories with multiple files and scripts:

```
skills/web/skills/frontend-design/
  SKILL.md                       # main skill file
  ux-psychology.md               # sub-topic
  color-system.md
  typography-system.md
  scripts/
    ux_audit.py                  # automation script
```

### manifest.yaml

```yaml
name: unity
version: 0.2.0
description: Unity game development skills
depends:
  - common
tags:
  - gamedev
  - csharp
  - unity
rules:
  - rules/csharp-patterns.md
skills:
  - skills/unity-architecture.md
  - skills/systematic-debugging.md
agents:
  - agents/unity-architect.md
  - agents/game-designer.md
```

### Content types

| Type | Purpose | Format |
|------|---------|--------|
| Rules | Always-active coding standards (20-50 lines) | Markdown |
| Skills | Domain knowledge, workflows, decision trees (100-600 lines) | Markdown with YAML frontmatter |
| Agents | Specialized AI personas with tools and model config | Markdown with YAML frontmatter |

## Tracking

Each project gets a `.skillpool.json` file tracking what is installed:

```json
{
  "version": "1.0.0",
  "installed": {
    "unity": {
      "version": "0.2.0",
      "installedAt": "2026-04-10T08:00:00Z",
      "targets": ["claude", "cursor"]
    },
    "common": {
      "version": "0.3.0",
      "installedAt": "2026-04-10T08:00:00Z",
      "targets": ["claude", "cursor"]
    }
  }
}
```

Commit this file to git so team members can run `skill-pool install` to get the same skills.

## Adapter System

Each adapter implements a standard interface:

```
detect(projectDir)   -> does this tool exist in the project?
install(pack, dir)   -> write rules/skills/agents to the right locations
remove(pack, dir)    -> remove managed files
list(dir)            -> list installed packs
```

### Where content goes

| Content | Claude | Cursor | Windsurf | Antigravity |
|---------|--------|--------|----------|-------------|
| Rules | `.claude/rules/<pack>-<name>.md` | `.cursor/rules/<pack>-<name>.mdc` | `.windsurf/rules/<pack>-<name>.md` | `.agent/rules/<pack>-<name>.md` |
| Skills | `.claude/skills/<pack>-<name>/` | `.cursor/skills/<pack>-<name>/` | `.windsurf/skills/<pack>-<name>/` | `.agent/skills/<pack>-<name>/` |
| Agents | `.claude/agents/<pack>-<name>.md` | `.cursor/rules/<pack>-agent-<name>.mdc` | `.windsurf/rules/<pack>-agent-<name>.md` | `.agent/agents/<pack>-<name>.md` |

Every managed file includes a marker comment for tracking:
```
<!-- skill-pool:unity:0.2.0 -->
```

## Plugin System

Add custom adapters via `.skillpoolrc.json`:

```json
{
  "adapters": {
    "my-ide": "./my-adapter.js"
  }
}
```

Custom adapters must export the same interface: `detect`, `install`, `remove`, `list`.

## Skill Sources

Content is curated and adapted from:

| Source | URL |
|--------|-----|
| Everything Claude Code | https://github.com/affaan-m/everything-claude-code |
| Antigravity Kit | https://github.com/vudovn/antigravity-kit |
| Agency Agents | https://github.com/msitarzewski/agency-agents |

Content is not copied verbatim. It is selected, reformatted, and quality-checked before inclusion.

## Feedback

If a skill gives wrong advice or an agent produces bad output, an issue will be automatically created at [h1dr0nn/agent-skill-pool](https://github.com/h1dr0nn/agent-skill-pool/issues). The `skill-feedback` skill in the `common` pack handles detection and reporting.

## Principles

1. **Install only what you need** - Choose packs, get only those packs plus their dependencies.
2. **Clean uninstall** - Every managed file has a marker. `remove` cleans everything.
3. **Git-friendly** - `.skillpool.json` is committable. Team members sync with one command.
4. **Format-agnostic** - Write once, install for Claude/Cursor/Windsurf/Antigravity.
5. **Composable** - Mix packs: `skill-pool install unity web` for a Unity WebGL project.

## License

MIT
