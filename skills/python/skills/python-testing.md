---
name: python-testing
description: Python testing with pytest - fixtures, parametrize, mocking, coverage. Use when writing or reviewing Python tests.
---

# Python Testing

## When to Activate
- Writing tests for Python code
- Setting up pytest fixtures
- Choosing mocking strategy
- Reviewing test coverage

## Framework: pytest

```python
def test_create_user_returns_user_with_id():
    # Arrange
    data = {"name": "Alice", "email": "alice@example.com"}

    # Act
    user = create_user(data)

    # Assert
    assert user.id is not None
    assert user.name == "Alice"
```

## Fixtures

```python
import pytest

@pytest.fixture
def db_session():
    session = create_test_session()
    yield session
    session.rollback()
    session.close()

@pytest.fixture
def sample_user(db_session):
    return UserFactory.create(session=db_session)
```

- Use fixtures for setup/teardown
- Scope appropriately: `function`, `class`, `module`, `session`
- Use `conftest.py` for shared fixtures

## Parametrize

```python
@pytest.mark.parametrize("input,expected", [
    ("hello", "HELLO"),
    ("world", "WORLD"),
    ("", ""),
])
def test_uppercase(input, expected):
    assert uppercase(input) == expected
```

## Mocking

```python
from unittest.mock import patch, MagicMock

def test_send_email_calls_smtp():
    with patch("app.email.smtp_client") as mock_smtp:
        send_welcome_email("user@test.com")
        mock_smtp.send.assert_called_once()
```

- Mock at the boundary (external APIs, databases)
- Prefer dependency injection over patching
- Don't mock what you don't own without integration tests

## Coverage

- Minimum 80% coverage
- Run: `pytest --cov=src --cov-report=term-missing`
- Focus on behavior coverage, not line coverage
