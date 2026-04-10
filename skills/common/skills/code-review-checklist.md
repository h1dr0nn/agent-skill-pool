---
name: code-review-checklist
description: Structured code review process - correctness, security, performance, quality, testing. Use when reviewing code changes or PRs.
---

# Code Review Checklist

## When to Activate
- Reviewing pull requests
- After writing or modifying code
- Before merging to shared branches
- When security-sensitive code changes

## Review Priority Order

### 1. Correctness (Blocker)
- [ ] Logic handles all edge cases (null, empty, boundary values)
- [ ] Error paths are handled explicitly
- [ ] No off-by-one errors
- [ ] Race conditions considered in async code
- [ ] State mutations are intentional and tracked

### 2. Security (Blocker)
- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] User input validated and sanitized
- [ ] No SQL injection (parameterized queries used)
- [ ] No XSS (output properly escaped)
- [ ] No path traversal (file paths sanitized)
- [ ] Auth checks present on protected routes
- [ ] Sensitive data not logged or exposed in errors

### 3. Performance (Warning)
- [ ] No N+1 queries (use JOINs or batching)
- [ ] No unbounded queries (LIMIT applied)
- [ ] Expensive operations cached where appropriate
- [ ] No unnecessary re-renders (React) or recomputations
- [ ] Large data sets paginated

### 4. Code Quality (Info)
- [ ] Functions < 50 lines, files < 800 lines
- [ ] Naming is clear and descriptive
- [ ] No deep nesting (> 4 levels)
- [ ] DRY - no copy-paste duplication
- [ ] Single responsibility per function/class
- [ ] No dead code or commented-out blocks

### 5. Testing (Warning)
- [ ] New functionality has tests
- [ ] Edge cases covered
- [ ] Tests are behavioral, not implementation-coupled
- [ ] Coverage >= 80%
- [ ] No flaky tests introduced

## Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| CRITICAL | Security vulnerability or data loss | **Block** - Must fix |
| HIGH | Bug or significant quality issue | **Warn** - Should fix |
| MEDIUM | Maintainability concern | **Info** - Consider fixing |
| LOW | Style or minor suggestion | **Note** - Optional |

## Review Comment Format

```markdown
**[SEVERITY]** Brief description

**Problem:** What's wrong and why it matters
**Suggestion:** How to fix it
**Example:** Code showing the fix (if helpful)
```

## AI-Specific Review Checks
- [ ] No hallucinated imports or APIs
- [ ] Generated code actually compiles/runs
- [ ] No over-engineered abstractions for simple problems
- [ ] Error handling is real, not placeholder
- [ ] Tests actually test behavior, not just exist

## Verdict

| Verdict | Criteria |
|---------|----------|
| **Approve** | No CRITICAL or HIGH issues |
| **Warning** | Only HIGH issues (merge with caution) |
| **Block** | CRITICAL issues found |
