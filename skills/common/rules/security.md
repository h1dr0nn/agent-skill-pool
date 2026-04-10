# Security

## Mandatory Checks Before Commit

- No hardcoded secrets (API keys, passwords, tokens)
- All user inputs validated
- SQL injection prevention (parameterized queries)
- XSS prevention (sanitized HTML output)
- CSRF protection on state-changing endpoints
- Authentication/authorization verified
- Error messages do not leak sensitive data

## Secret Management

- Use environment variables or a secret manager
- Validate required secrets at startup
- Rotate any secrets that may have been exposed
- Never log secrets or include them in error messages

## Dependency Security

- Audit dependencies regularly (`npm audit`, `pip audit`)
- Pin dependency versions in production
- Review new dependencies before adding
- Prefer well-maintained packages with active security response
