---
name: database-patterns
description: Database design and optimization - schema design, query optimization, N+1 prevention, migrations, connection pooling. Use when working with databases.
---

# Database Patterns

## When to Activate
- Designing database schema
- Optimizing slow queries
- Writing migrations
- Debugging N+1 queries
- Setting up connection pooling

## Schema Design

### Primary Keys
| Option | When | Example |
|--------|------|---------|
| UUID v4 | Distributed systems | No coordination needed |
| ULID | Sorted + distributed | Time-sortable UUID |
| Auto-increment | Simple apps | Single database |

### Standard Columns
Every table should have:
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
deleted_at  TIMESTAMPTZ  -- soft delete (nullable)
```

### Normalization vs Denormalization
- Normalize to 3NF by default
- Denormalize intentionally for read-heavy access patterns
- Document every denormalization with the reason

## Query Optimization

### Index Strategy
- Add indexes for WHERE, JOIN, ORDER BY columns
- Composite indexes: column order matters (most selective first)
- Partial indexes for filtered queries
- Always verify with `EXPLAIN ANALYZE`

### N+1 Prevention

```sql
-- BAD: N+1 (one query per user for orders)
SELECT * FROM users;
-- then for EACH user:
SELECT * FROM orders WHERE user_id = ?;

-- GOOD: JOIN
SELECT u.*, o.id as order_id, o.total
FROM users u
LEFT JOIN orders o ON o.user_id = u.id;

-- GOOD: Batch
SELECT * FROM orders WHERE user_id IN (?, ?, ?, ...);
```

### ORM Equivalents
```
# Django: select_related (JOIN) / prefetch_related (batch)
User.objects.select_related('profile').prefetch_related('orders')

# Prisma: include
prisma.user.findMany({ include: { orders: true } })

# TypeORM: relations
userRepo.find({ relations: ['orders'] })
```

## Migrations

### Rules
1. One migration per schema change
2. Always include rollback (down migration)
3. Never modify deployed migrations
4. Test on production-size data before deploying
5. Separate data migrations from schema migrations

### Safe Migration Patterns

| Operation | Safe Approach |
|-----------|--------------|
| Add column | Add nullable, backfill, then add NOT NULL |
| Remove column | Stop reading first, then drop in next deploy |
| Rename column | Add new, copy data, update code, drop old |
| Add index | `CREATE INDEX CONCURRENTLY` (Postgres) |

## Connection Pooling

### Pool Size Formula
```
connections = (CPU cores * 2) + disk_spindles
```

### Configuration
| Setting | Recommended |
|---------|------------|
| Min connections | 2-5 |
| Max connections | 20-50 |
| Idle timeout | 10-30 seconds |
| Max lifetime | 30 minutes |
| Connection timeout | 5 seconds |

## Security

- Parameterized queries ONLY (never string interpolation)
- Least-privilege database users per service
- Encrypt sensitive columns at rest
- Audit trail for sensitive data access
- Regular backup testing (restore drills)

## Anti-Patterns

| Don't | Do Instead |
|-------|-----------|
| `SELECT *` | Specify needed columns |
| String concatenation in SQL | Parameterized queries |
| No indexes on foreign keys | Index all FK columns |
| Modify deployed migrations | Create new migration |
| Store files in DB | Store in object storage, reference by URL |
| Unbounded queries | Always add LIMIT |
