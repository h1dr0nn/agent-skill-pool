# Component Catalog

Quick reference for all custom IMGUI components in this skill.

## Buttons

| Component | Use Case | Sizing |
|-----------|----------|--------|
| `DrawColorButton` | Standalone actions (Sync, Build, Create) | Height 36 default, full-width or fixed |
| `DrawAccentButton` | Primary action (Preview, Sync) | Accent color, full-width |
| Inline `miniButton` | Next to fields (Show/Hide, Refresh) | fixedHeight 18, fixed width |
| `DrawSmallButton` | Utility row (All, None, New Only) | fixedHeight 18, auto width |

## Layout

| Component | Purpose |
|-----------|---------|
| `BeginCard` / `EndCard` | Bordered section with title + separator |
| `DrawTabBar` | Animated tab switcher with slide transition |
| `DrawSeparator` | 1px horizontal line |
| `Indent` | 14px left margin wrapper |

## Data Display

| Component | Purpose |
|-----------|---------|
| `DrawKeyValue` | Label: Value pair row |
| `DrawBadge` | Small colored tag (counts, status) |
| Mini progress bar | Indeterminate loading overlay on card title |

## Color Semantics

| Color | Meaning | Example |
|-------|---------|---------|
| Accent (blue) | Primary action | Sync, Build, Preview |
| BtnGray | Neutral / utility | Reload, Show/Hide, Refresh |
| BtnRed | Destructive / cancel | Cancel, Clear, Delete |
| BtnGreen | Confirm / save | Save |
| BtnOrange | Caution / force | Force Sync |
| ErrorText | Error state | Invalid URL |
| SuccessText | Success state | Valid URL, Cached |
| MutedText | Secondary info | Timestamps, hints |
