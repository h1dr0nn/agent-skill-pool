---
name: clean-code
description: Pragmatic coding standards - SRP, DRY, KISS, YAGNI, naming, function design, code structure. Use as general coding guidance.
---

# Clean Code

## When to Activate
- Writing new code
- Refactoring existing code
- Reviewing code quality
- Onboarding to coding standards

## Core Principles

| Principle | Meaning | Application |
|-----------|---------|-------------|
| **SRP** | Single Responsibility | One reason to change per module |
| **DRY** | Don't Repeat Yourself | Extract when repetition is real (3+) |
| **KISS** | Keep It Simple | Simplest solution that works |
| **YAGNI** | You Aren't Gonna Need It | Don't build for hypothetical futures |
| **Boy Scout** | Leave it better | Small improvements on each touch |

## Naming

### Rules
- Names reveal intent: `getUserById` not `getData`
- Booleans: `isActive`, `hasPermission`, `canDelete`
- Functions: verb + noun: `calculateTotal`, `validateEmail`
- Avoid abbreviations unless universally known (URL, HTTP, ID)
- Searchable names: `MAX_RETRY_COUNT` not `3`

### Anti-patterns
| Bad | Good | Why |
|-----|------|-----|
| `data` | `userProfile` | What data? |
| `temp` | `swapBuffer` | Purpose unclear |
| `flag` | `isEnabled` | What flag? |
| `process()` | `validateAndSave()` | What process? |
| `x, y` (outside math) | `width, height` | Context lost |

## Function Design

### Rules
- **Small**: < 50 lines, ideally < 20
- **Focused**: Does one thing well
- **Few arguments**: 0-3 parameters, use objects for more
- **No side effects**: Or name them clearly (`saveAndNotify`)
- **Return early**: Guard clauses at the top

### Pattern: Guard Clauses
```
// BAD: Deep nesting
function process(user) {
  if (user) {
    if (user.isActive) {
      if (user.hasPermission) {
        // actual logic buried here
      }
    }
  }
}

// GOOD: Early returns
function process(user) {
  if (!user) return;
  if (!user.isActive) return;
  if (!user.hasPermission) return;
  // actual logic at top level
}
```

## Code Structure

### Composition Over Inheritance
- Prefer small, composable functions
- Use dependency injection for flexibility
- Avoid deep inheritance hierarchies

### Immutability
- Create new objects instead of mutating
- Use spread/destructuring for updates
- Const by default, let only when needed

### Error Handling
- Handle errors explicitly, never silently swallow
- Use specific exception types
- Fail fast with clear messages
- Log context, not just the error message

## Self-Check Before Completing

- [ ] Can I explain each function in one sentence?
- [ ] Are there any functions > 50 lines?
- [ ] Are there any files > 800 lines?
- [ ] Is there any copy-pasted code?
- [ ] Would a new team member understand this?
- [ ] Are error cases handled?
- [ ] Are there any magic numbers/strings?
