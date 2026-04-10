# Git Workflow

## Commit Message Format

```
<type>: <description>

<optional body>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

## Branch Strategy

- `main` - production-ready code
- `feat/<name>` - new features
- `fix/<name>` - bug fixes
- `refactor/<name>` - code improvements

## Pull Request Process

1. Analyze full commit history (not just latest commit)
2. Use `git diff main...HEAD` to see all changes
3. Write concise PR title (<70 chars)
4. Include test plan with verification steps
5. Push with `-u` flag for new branches

## Commit Best Practices

- One logical change per commit
- Write commit messages that explain "why" not "what"
- Never commit secrets, credentials, or API keys
- Keep commits small and reviewable
