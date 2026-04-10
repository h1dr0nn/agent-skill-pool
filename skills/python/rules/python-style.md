# Python Style

## Standards

- Follow PEP 8 conventions
- Use type annotations on all function signatures
- Format with `black`, sort imports with `isort`, lint with `ruff`

## Type Hints

```python
def get_user(user_id: str) -> User | None:
    ...

def process_items(items: list[str], *, limit: int = 10) -> dict[str, int]:
    ...
```

- Use `|` union syntax (Python 3.10+) over `Optional`/`Union`
- Use `from __future__ import annotations` for older versions
- Add return types to all public functions

## Immutability

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class User:
    name: str
    email: str

from typing import NamedTuple

class Point(NamedTuple):
    x: float
    y: float
```

- Prefer frozen dataclasses and NamedTuples
- Use tuples over lists for fixed collections
- Avoid mutating function arguments

## Error Handling

```python
# Specific exceptions, not bare except
try:
    result = risky_operation()
except ValueError as e:
    logger.error("Invalid value: %s", e)
    raise
except Exception:
    logger.exception("Unexpected error")
    raise
```

- Never use bare `except:`
- Catch specific exceptions
- Use `raise` to re-raise, `raise X from Y` for chaining
- Use custom exceptions for domain errors

## Naming

- `snake_case` for functions, variables, modules
- `PascalCase` for classes
- `UPPER_SNAKE_CASE` for constants
- `_private` prefix for internal use
- Avoid single-letter names except in comprehensions
