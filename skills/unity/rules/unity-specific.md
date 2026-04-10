# Unity-Specific Rules

## Update vs FixedUpdate

- `Update()` - input handling, UI, visual updates (frame-dependent)
- `FixedUpdate()` - physics, rigidbody movement (time-step dependent)
- `LateUpdate()` - camera follow, post-processing after movement
- Never mix physics in `Update()` or input in `FixedUpdate()`

## Coroutines vs Async/Await

- Coroutines for Unity-lifecycle-aware delays and sequences
- `async/await` for I/O operations (file, network)
- Use `UniTask` if available for allocation-free async
- Always handle coroutine cleanup in `OnDisable()`/`OnDestroy()`

```csharp
private Coroutine _activeRoutine;

private void OnDisable()
{
    if (_activeRoutine != null)
        StopCoroutine(_activeRoutine);
}
```

## Asset Management

- Addressables for large/downloadable assets
- Resources folder only for small, always-needed assets
- Use asset bundles for DLC/modular content
- Unload unused assets after scene transitions

## Physics

- Use layers and layer masks for collision filtering
- Prefer `Physics.RaycastNonAlloc` over `Physics.RaycastAll`
- Set fixed timestep appropriately (default 0.02 = 50 FPS physics)
- Use `CompareTag()` instead of `gameObject.tag == "string"`

## Editor & Debugging

- Use `[Header]`, `[Tooltip]`, `[Range]` for inspector usability
- Custom editor scripts for complex components
- Use `Debug.DrawRay`/`Debug.DrawLine` for visual debugging
- Gizmos for editor-only visualization

## CoPlay MCP Integration

- Use CoPlay MCP tools for scene manipulation when available
- Prefer `set_property` over manual script edits for component values
- Use `list_game_objects_in_hierarchy` to understand scene structure
- Use `check_compile_errors` after code changes
