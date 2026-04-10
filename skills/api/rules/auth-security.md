# Authentication & API Security

## Auth Strategy Selection

| Strategy | Use When |
|----------|----------|
| JWT | Stateless APIs, microservices |
| Session | Server-rendered apps, simple setups |
| API Keys | Service-to-service, public APIs |
| OAuth 2.0 | Third-party integrations |
| Passkeys | Modern user auth (WebAuthn) |

## JWT Best Practices

- Short expiry (15 min access, 7 day refresh)
- Store refresh token in HTTP-only secure cookie
- Never store JWT in localStorage
- Include only necessary claims (no sensitive data)
- Validate `iss`, `aud`, `exp` on every request

## Password Handling

- Hash with bcrypt (cost factor 12+) or Argon2
- Never store plaintext passwords
- Enforce minimum 8 characters
- Check against breached password lists (HIBP)

## API Security Checklist

- [ ] Input validation on all endpoints (Zod, Joi, class-validator)
- [ ] Parameterized queries (never string concatenation for SQL)
- [ ] Rate limiting on auth endpoints (stricter: 5 attempts/min)
- [ ] CORS configured for specific origins only
- [ ] HTTPS enforced (HSTS header)
- [ ] No sensitive data in error responses
- [ ] Audit logging for auth events

## Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
```
