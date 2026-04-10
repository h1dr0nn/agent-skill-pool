---
name: systematic-debugging
description: 4-phase debugging methodology with root cause analysis. Use when debugging complex issues instead of random guessing.
---

# Systematic Debugging

## When to Activate
- Bug reports or unexpected behavior
- Intermittent/flaky issues
- Performance regressions
- Post-deploy incidents

## 4-Phase Process

### Phase 1: Reproduce
Before fixing anything, reliably reproduce the issue.

```markdown
## Reproduction Steps
1. [Exact step to reproduce]
2. [Next step]
3. [Expected vs actual result]

## Reproduction Rate
- [ ] Always (100%)
- [ ] Often (50-90%)
- [ ] Sometimes (10-50%)
- [ ] Rare (<10%)
```

### Phase 2: Isolate
Narrow down the source.

| Question | Answer |
|----------|--------|
| When did this start? | Check git log, recent deploys |
| What changed recently? | Diff against last working state |
| All environments? | Local, staging, production |
| Minimal reproduction? | Strip to smallest case |

### Phase 3: Understand (Root Cause)
Find the root cause, not just symptoms.

**The 5 Whys:**
1. Why does the bug happen?
2. Why does that condition exist?
3. Why wasn't it caught?
4. Why is the system designed this way?
5. What is the fundamental cause?

### Phase 4: Fix & Verify

```markdown
## Fix Verification
- [ ] Bug no longer reproduces
- [ ] Related functionality still works
- [ ] No new issues introduced
- [ ] Regression test added
- [ ] Similar code checked for same issue
```

## Debugging Checklist

### Before Starting
- [ ] Can reproduce consistently
- [ ] Have minimal reproduction case
- [ ] Understand expected behavior

### During Investigation
- [ ] Check recent changes (`git log --oneline -20`)
- [ ] Check logs for errors
- [ ] Add targeted logging if needed
- [ ] Use debugger/breakpoints
- [ ] Binary search through commits if needed (`git bisect`)

### After Fix
- [ ] Root cause documented
- [ ] Fix verified in all affected environments
- [ ] Regression test added
- [ ] Similar code audited

## Anti-Patterns

| Don't | Do Instead |
|-------|-----------|
| Random changes ("maybe this fixes it") | Reproduce first, then hypothesize |
| Ignore evidence ("that can't be it") | Follow the evidence objectively |
| Assume without proof | Verify every assumption |
| Fix without reproducing | Always reproduce first |
| Stop at symptoms | Find the root cause |
| Skip the regression test | Always add one |
