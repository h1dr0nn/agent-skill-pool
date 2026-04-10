# Rust Coding Style

Concise Rust coding style rules for idiomatic, safe, and maintainable code.

## Formatting

- Use `rustfmt` for all formatting — never override defaults without team consensus
- Run `cargo fmt --check` in CI to enforce consistency
- Maximum line length: 100 characters (rustfmt default)

## Linting

- Run `cargo clippy -- -D warnings` before every commit
- Fix all clippy warnings; do not suppress with `#[allow(...)]` without justification
- Use `#[expect(...)]` (Rust 1.81+) over `#[allow(...)]` when suppression is necessary — it warns when the suppression becomes unused

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Crates | `snake_case` | `my_crate` |
| Modules | `snake_case` | `data_store` |
| Types (struct, enum, trait) | `PascalCase` | `HttpClient`, `ParseError` |
| Functions, methods | `snake_case` | `process_batch` |
| Local variables | `snake_case` | `retry_count` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRIES` |
| Type parameters | Single uppercase or `PascalCase` | `T`, `Item` |
| Lifetimes | Short lowercase | `'a`, `'ctx` |
| Feature flags | `kebab-case` | `async-runtime` |

- Boolean methods/fields: use `is_`, `has_`, `can_`, `should_` prefixes
- Conversion methods: `to_*` (expensive), `as_*` (cheap/borrow), `into_*` (consuming)
- Fallible constructors: `new` for infallible, `try_new` or `from_*` returning `Result` for fallible

## Error Handling

- Use `thiserror` for library error types — derive `Display` and `Error` automatically
- Use `anyhow` for application-level error propagation with context
- Never use `.unwrap()` or `.expect()` in library code — propagate with `?`
- `.expect("reason")` is acceptable in application `main()` or tests with a clear message
- Define domain-specific error enums; avoid stringly-typed errors

```rust
// Library error with thiserror
#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("missing required field: {0}")]
    MissingField(String),
    #[error("invalid value for {field}: {reason}")]
    InvalidValue { field: String, reason: String },
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

// Application error with anyhow
use anyhow::{Context, Result};

fn load_config(path: &str) -> Result<Config> {
    let content = std::fs::read_to_string(path)
        .with_context(|| format!("failed to read config from {path}"))?;
    toml::from_str(&content)
        .context("failed to parse config")
}
```

## Ownership Idioms

- Prefer borrowing (`&T`, `&mut T`) over cloning — clone only when ownership is truly needed
- Use `Cow<'_, str>` when a function may or may not need to allocate
- Accept `impl AsRef<str>` or `&str` for string inputs, not `String`
- Return owned types (`String`, `Vec<T>`) from constructors and builders
- Use `Arc<T>` for shared ownership across threads; prefer `Rc<T>` in single-threaded contexts
- Avoid `RefCell` / interior mutability unless the design requires it — prefer restructuring

## Type System

- Use newtypes to enforce domain invariants: `struct UserId(u64)`
- Prefer `enum` over boolean flags for clarity: `enum Mode { Read, Write }` over `is_write: bool`
- Use `#[must_use]` on functions whose return value should not be silently ignored
- Derive standard traits in consistent order: `Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize`

## Modules and Visibility

- Default to private — only `pub` what is part of the public API
- Use `pub(crate)` for crate-internal shared items
- Keep module files small (< 400 lines); split into submodules when needed
- Re-export public API from `lib.rs` for a flat, discoverable surface

## Documentation

- All public items must have `///` doc comments
- Include a one-line summary, then details if needed
- Add `# Examples` with ````rust` blocks that compile (doctests)
- Use `//!` module-level docs in `lib.rs` and key modules

## Checklist

Before marking Rust work complete:

- [ ] `cargo fmt --check` passes
- [ ] `cargo clippy -- -D warnings` passes
- [ ] No `.unwrap()` in library code
- [ ] Error types use `thiserror` or `anyhow` appropriately
- [ ] Public API has doc comments
- [ ] No unnecessary `clone()` calls
- [ ] Newtypes used for domain identifiers
- [ ] `#[must_use]` on functions with important return values
