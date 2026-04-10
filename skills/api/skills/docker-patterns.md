---
name: docker-patterns
description: Docker and Docker Compose patterns - Dockerfiles, multi-stage builds, compose services, networking, volumes, security. Use when containerizing applications.
---

# Docker Patterns

## When to Activate
- Containerizing an application
- Writing Dockerfiles
- Setting up Docker Compose for local dev
- Optimizing Docker image size
- Debugging container issues

## Dockerfile Best Practices

### Multi-Stage Build (Node.js)
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Multi-Stage Build (Python)
```dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
COPY --from=builder /install /usr/local
COPY . .

USER nobody
EXPOSE 8000
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0"]
```

### Layer Optimization
1. Copy dependency files first (cache-friendly)
2. Install dependencies (cached if unchanged)
3. Copy source code last (changes most often)
4. Use `.dockerignore` to exclude node_modules, .git, etc.

## Docker Compose

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/app
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./src:/app/src  # Dev hot-reload

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: app
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

## Security

- Run as non-root user (`USER node` / `USER nobody`)
- Use specific image tags, not `latest`
- Scan images: `docker scout cves`
- Don't store secrets in images (use env vars or secrets)
- Use `.dockerignore` to exclude sensitive files
- Minimize installed packages (use alpine/slim bases)

## Debugging

```bash
# Shell into running container
docker exec -it container_name sh

# View logs
docker logs -f container_name

# Inspect container
docker inspect container_name

# Check resource usage
docker stats
```

## Anti-Patterns

| Don't | Do Instead |
|-------|-----------|
| `FROM node:latest` | `FROM node:20-alpine` (pin version) |
| Run as root | `USER node` or `USER nobody` |
| `COPY . .` first | Copy package.json first, install, then copy source |
| Store secrets in image | Use environment variables or Docker secrets |
| Single-stage builds | Multi-stage for smaller images |
| Ignore .dockerignore | Exclude node_modules, .git, .env |
