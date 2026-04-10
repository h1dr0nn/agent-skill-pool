# Go Coding Style

> This file extends [common/coding-style.md](../../../rules/common/coding-style.md) with Go-specific conventions.

## Formatting

- Always run `gofmt` or `goimports` on all `.go` files before committing.
- Do not argue about formatting -- `gofmt` is the single source of truth.
- Use `goimports` to manage import grouping automatically.

## Naming Conventions

- **Packages**: Short, lowercase, single-word names. No underscores or mixedCaps.
  - Good: `http`, `user`, `auth`
  - Bad: `httpHandler`, `user_service`, `authUtils`
- **Exported names**: PascalCase (`GetUser`, `Config`, `ErrNotFound`).
- **Unexported names**: camelCase (`parseConfig`, `defaultTimeout`).
- **Interfaces**: Name by behavior, not by the type they wrap.
  - Single-method interfaces use the method name plus `-er` suffix: `Reader`, `Writer`, `Closer`.
- **Acronyms**: Keep consistent casing (`HTTP`, `ID`, `URL` -- not `Http`, `Id`, `Url`).
- **Error variables**: Prefix with `Err` (`ErrNotFound`, `ErrTimeout`).
- **Error types**: Suffix with `Error` (`ValidationError`, `TimeoutError`).

## Error Handling

- Always check returned errors. Never discard with `_` unless justified in a comment.
- Wrap errors with `fmt.Errorf("context: %w", err)` to preserve the chain.
- Use `errors.Is` and `errors.As` for comparison -- not `==`.
- Error messages: lowercase, no trailing punctuation.
- Never use `panic` for recoverable errors. Reserve `panic` for truly unrecoverable programmer bugs.
- Return early on error to keep the happy path unindented.

## Package Organization

- Use `cmd/` for executable entry points, `internal/` for private packages, `pkg/` for public libraries.
- Keep packages focused on a single responsibility.
- Define interfaces in the consumer package, not the provider.
- Avoid `init()` functions and package-level mutable state. Prefer dependency injection.

## Concurrency

- Pass `context.Context` as the first parameter to functions that may block or need cancellation.
- Never store `context.Context` in a struct field.
- Use `defer mu.Unlock()` immediately after `mu.Lock()`.
- Prefer `errgroup` for coordinating goroutines with error propagation.
- Always provide a cancellation path for goroutines to prevent leaks.

## Idiomatic Patterns

- Accept interfaces, return structs.
- Make the zero value useful.
- Prefer composition over inheritance (embedding).
- Use the functional options pattern for configurable constructors.
- Preallocate slices and maps when the size is known.
- Use `strings.Builder` for string concatenation in loops.
