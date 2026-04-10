# Coding Style

## Immutability

Always create new objects instead of mutating existing ones. Immutable data prevents hidden side effects and enables safe concurrency.

## File Organization

- Many small files over few large files
- 200-400 lines typical, 800 max
- Organize by feature/domain, not by type
- High cohesion, low coupling

## Naming

- Variables and functions: `camelCase`
- Booleans: `is`, `has`, `should`, `can` prefixes
- Interfaces/types/components: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`

## Error Handling

- Handle errors explicitly at every level
- User-friendly messages in UI code
- Detailed error context in server logs
- Never silently swallow errors

## Input Validation

- Validate all user input before processing
- Use schema-based validation where available
- Fail fast with clear error messages

## Code Smells

- No deep nesting (>4 levels) - use early returns
- No magic numbers - use named constants
- No long functions (>50 lines) - split into focused pieces
- No mutation - prefer immutable patterns
