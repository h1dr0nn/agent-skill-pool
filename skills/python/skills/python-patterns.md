---
name: python-patterns
description: Python idioms and patterns - context managers, protocols, generators, async, Django/FastAPI. Use when writing Python code.
---

# Python Patterns

## When to Activate
- Writing Python applications
- Choosing design patterns for Python
- Working with Django or FastAPI
- Async programming decisions

## Context Managers

```python
from contextlib import contextmanager

@contextmanager
def managed_connection(url: str):
    conn = create_connection(url)
    try:
        yield conn
    finally:
        conn.close()
```

- Use `with` statements for resource management
- Write custom context managers for setup/teardown pairs

## Protocol Types (Structural Typing)

```python
from typing import Protocol

class Repository(Protocol):
    def find_by_id(self, id: str) -> dict | None: ...
    def save(self, entity: dict) -> dict: ...

# Any class with these methods satisfies the protocol
class PostgresRepo:
    def find_by_id(self, id: str) -> dict | None:
        ...
    def save(self, entity: dict) -> dict:
        ...
```

## Generators for Large Data

```python
def read_large_file(path: str):
    with open(path) as f:
        for line in f:
            yield line.strip()

# Process without loading all into memory
for line in read_large_file("data.csv"):
    process(line)
```

## Async Patterns

```python
import asyncio
import httpx

async def fetch_all(urls: list[str]) -> list[dict]:
    async with httpx.AsyncClient() as client:
        tasks = [client.get(url) for url in urls]
        responses = await asyncio.gather(*tasks)
        return [r.json() for r in responses]
```

- Use `asyncio.gather` for concurrent I/O
- Use `async with` for async context managers
- Never mix sync and async without `asyncio.to_thread`

## Django Specifics

- Fat models, thin views
- Use `select_related` / `prefetch_related` to avoid N+1
- Custom managers for complex querysets
- Signals only for cross-app concerns

## FastAPI Specifics

- Use Pydantic models for request/response validation
- Dependency injection via `Depends()`
- Background tasks for non-blocking operations
- Async endpoints for I/O-bound work
