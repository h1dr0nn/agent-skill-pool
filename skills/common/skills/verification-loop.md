---
name: verification-loop
description: Comprehensive verification system - build, type check, lint, test, security scan, diff review. Use after completing features, before PRs, after refactoring.
---

# Verification Loop

## When to Activate
- After completing a feature or significant code change
- Before creating a PR
- After refactoring
- When you want to ensure quality gates pass

## Verification Phases

### Phase 1: Build Verification
```bash
# Check if project builds
npm run build 2>&1 | tail -20
# OR: pnpm build / cargo build / go build ./...
```
If build fails, STOP and fix before continuing.

### Phase 2: Type Check
```bash
# TypeScript
npx tsc --noEmit 2>&1 | head -30

# Python
pyright . 2>&1 | head -30
# OR: mypy src/

# Go
go vet ./...

# Rust
cargo check
```

### Phase 3: Lint Check
```bash
# JavaScript/TypeScript
npm run lint 2>&1 | head -30

# Python
ruff check . 2>&1 | head -30

# Go
golangci-lint run

# Rust
cargo clippy
```

### Phase 4: Test Suite
```bash
# Run tests with coverage
npm run test -- --coverage 2>&1 | tail -50
# Target: 80% minimum coverage
```

Report:
- Total tests: X
- Passed: X
- Failed: X
- Coverage: X%

### Phase 5: Security Scan
```bash
# Check for hardcoded secrets
grep -rn "sk-\|api_key\|password\s*=" --include="*.ts" --include="*.js" src/ 2>/dev/null

# Check for console.log in production
grep -rn "console.log" --include="*.ts" --include="*.tsx" src/ 2>/dev/null

# Dependency audit
npm audit --production
```

### Phase 6: Diff Review
```bash
git diff --stat
git diff HEAD~1 --name-only
```

Review each changed file for:
- Unintended changes
- Missing error handling
- Potential edge cases

## Output Format

```markdown
## Verification Report

| Phase | Status | Details |
|-------|--------|---------|
| Build | PASS/FAIL | ... |
| Types | PASS/FAIL | X errors |
| Lint | PASS/FAIL | X warnings |
| Tests | PASS/FAIL | X/Y passed, Z% coverage |
| Security | PASS/FAIL | X issues |
| Diff Review | PASS/FAIL | X files changed |

**Verdict:** SHIP IT / NEEDS WORK
```

## Rules
- Never skip a phase
- Fix build/type errors before running tests
- Security issues are always CRITICAL
- Coverage below 80% is a warning, below 60% is a blocker
