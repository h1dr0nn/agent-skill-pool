# C# Patterns for Unity

## MonoBehaviour Guidelines

- Keep MonoBehaviours thin - delegate logic to plain C# classes
- Use `[SerializeField] private` instead of `public` fields
- Cache component references in `Awake()`, not `Start()`
- Avoid `GetComponent<T>()` in `Update()` - cache it

```csharp
[SerializeField] private float moveSpeed = 5f;
[SerializeField] private Transform target;

private Rigidbody _rb;

private void Awake()
{
    _rb = GetComponent<Rigidbody>();
}
```

## Null Safety

- Use `TryGetComponent<T>()` instead of null-checking `GetComponent<T>()`
- Check `UnityEngine.Object` with `== null` (not `is null`) due to Unity's null override
- Use `?` operator carefully - it bypasses Unity's null check

## Naming Conventions

- Private fields: `_camelCase` with underscore prefix
- Public properties: `PascalCase`
- Methods: `PascalCase`
- Constants: `UPPER_SNAKE_CASE` or `PascalCase`
- Interfaces: `I` prefix (`IInteractable`, `IDamageable`)

## Common Patterns

- Object pooling for frequently spawned objects
- Command pattern for input handling and undo
- Observer pattern via C# events or UnityEvents
- State machine for character/AI behavior

## Performance

- Avoid `LINQ` in hot paths (allocations)
- Use `StringBuilder` for string concatenation
- Prefer `struct` for small, short-lived data
- Cache `WaitForSeconds` instances for coroutines
