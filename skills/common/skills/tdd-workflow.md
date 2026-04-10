---
name: tdd-workflow
description: Test-Driven Development workflow - RED-GREEN-REFACTOR cycle, AAA pattern, test prioritization. Use when writing new features, fixing bugs, or refactoring.
---

# TDD Workflow

## When to Activate
- Writing new features or functionality
- Fixing bugs (write test that reproduces bug first)
- Refactoring existing code
- Creating new components or modules

## The TDD Cycle

```
RED    → Write a failing test
  ↓
GREEN  → Write minimal code to pass
  ↓
REFACTOR → Improve code quality
  ↓
Repeat...
```

## The Three Laws

1. Write production code **only** to make a failing test pass
2. Write only enough test to demonstrate failure
3. Write only enough code to make the test pass

## RED Phase

### What to Test First

| Priority | Test Type | Example |
|----------|-----------|---------|
| 1 | Happy path | "should create user with valid data" |
| 2 | Error cases | "should throw for invalid email" |
| 3 | Edge cases | "should handle empty input" |
| 4 | Performance | "should process 1000 items under 100ms" |

### Rules
- Test MUST fail first (if it passes, something is wrong)
- Test name describes expected behavior
- One assertion per test (ideally)
- Test behavior, not implementation

## GREEN Phase

| Principle | Meaning |
|-----------|---------|
| **YAGNI** | You Aren't Gonna Need It |
| **Simplest thing** | Write the minimum to pass |
| **No optimization** | Just make it work |

### Rules
- Don't write unneeded code
- Don't optimize yet
- Pass the test, nothing more

## REFACTOR Phase

| Area | Action |
|------|--------|
| Duplication | Extract common code |
| Naming | Make intent clear |
| Structure | Improve organization |
| Complexity | Simplify logic |

### Rules
- All tests MUST stay green
- Small incremental changes
- Commit after each refactor

## AAA Pattern

Every test follows Arrange-Act-Assert:

```
// Arrange - Set up test data and preconditions
const user = createTestUser({ role: "admin" });

// Act - Execute the code under test
const result = canDeletePost(user, post);

// Assert - Verify expected outcome
expect(result).toBe(true);
```

## Test Naming

Use descriptive names that explain behavior:

```
test('returns empty array when no markets match query')
test('throws error when API key is missing')
test('falls back to substring search when Redis is unavailable')
```

## Coverage Requirements

| Type | Minimum |
|------|---------|
| Unit tests | 80% line coverage |
| Integration tests | Critical paths covered |
| E2E tests | Core user flows |

## Anti-Patterns

| Don't | Do Instead |
|-------|-----------|
| Skip the RED phase | Watch test fail first |
| Write tests after code | Write tests before code |
| Over-engineer initial implementation | Keep it simple (GREEN) |
| Multiple asserts per test | One behavior per test |
| Test implementation details | Test behavior and outcomes |
| Mock everything | Mock only at boundaries |

## AI-Augmented TDD

### Multi-Agent Pattern

| Agent | Role |
|-------|------|
| Agent A | Write failing tests (RED) |
| Agent B | Implement to pass (GREEN) |
| Agent C | Review and optimize (REFACTOR) |

This separation prevents the bias of writing tests to match existing code.
