---
name: deployment-patterns
description: Production deployment workflows - platform selection, pre-deploy checks, rollback strategies, zero-downtime patterns. Use when deploying or planning deployment.
---

# Deployment Patterns

## When to Activate
- Deploying to production
- Setting up CI/CD pipelines
- Planning deployment strategy
- Handling deployment failures

## Platform Decision Tree

| App Type | Recommended | Alternative |
|----------|------------|-------------|
| Static site | Vercel, Cloudflare Pages | Netlify, S3+CloudFront |
| Web app (SSR) | Vercel, Railway | Fly.io, Render |
| API service | Railway, Fly.io | AWS ECS, GCP Cloud Run |
| Microservices | Kubernetes | Docker Swarm, Nomad |
| Serverless | AWS Lambda, Cloudflare Workers | Vercel Functions |

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] Build succeeds locally
- [ ] No linting errors
- [ ] Code reviewed and approved

### Environment
- [ ] Environment variables configured
- [ ] Secrets rotated if needed
- [ ] Database migrations ready
- [ ] Feature flags set correctly

### Safety
- [ ] Rollback plan documented
- [ ] Database backup taken
- [ ] Monitoring alerts configured
- [ ] On-call team notified

## Deployment Workflow

### Phase 1: Prepare
- Run full test suite
- Build production artifacts
- Verify environment config

### Phase 2: Backup
- Database snapshot
- Note current deployed version (git SHA)
- Export current config

### Phase 3: Deploy
- Run database migrations
- Deploy application
- Verify health checks pass

### Phase 4: Verify
- [ ] Health endpoint responding
- [ ] Key user flows working
- [ ] No error rate spike
- [ ] Performance metrics normal
- [ ] Logs show expected behavior

### Phase 5: Confirm or Rollback
- If all checks pass: mark deployment complete
- If issues found: execute rollback plan

## Zero-Downtime Strategies

| Strategy | How It Works | Best For |
|----------|-------------|----------|
| **Rolling** | Replace instances one at a time | Standard deployments |
| **Blue-Green** | Switch traffic between two environments | Critical services |
| **Canary** | Route small % of traffic to new version | High-risk changes |

## Rollback Plan

```bash
# Quick rollback
git revert HEAD
git push origin main

# Database rollback
npm run migrate:rollback
# OR: flyway undo / alembic downgrade

# Container rollback
docker pull app:previous-version
docker-compose up -d
```

## Anti-Patterns

| Don't | Do Instead |
|-------|-----------|
| Deploy on Friday afternoon | Deploy early in the week |
| Skip staging | Always test in staging first |
| Deploy without monitoring | Set up alerts before deploy |
| Big bang releases | Small, incremental deployments |
| Manual deployments | Automate with CI/CD |
| Skip database backups | Always backup before migrations |
