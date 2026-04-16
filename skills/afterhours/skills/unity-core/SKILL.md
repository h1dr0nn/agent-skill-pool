---
name: unity-core
description: Core architecture for Afterhours Foundation - DI, services, async/reactive, game flow, and scene management. Load when working with VContainer, UniTask, R3, signals, UniState, or SceneService.
---

# Afterhours Foundation - Core Architecture

This skill covers the backbone of the Afterhours Foundation project: dependency injection, services, async/reactive patterns, and game flow.

- [DI Patterns](references/di-patterns.md) — VContainer registration, lifetime, injection rules, entry points
- [Services Reference](references/services-reference.md) — All registered services and their APIs
- [UniTask Patterns](references/unitask-patterns.md) — Async/await, cancellation, parallel ops
- [R3 Patterns](references/r3-patterns.md) — ReactiveProperty, Observable, disposal
- [Signals Reference](references/signals-reference.md) — Built-in signals, creating signals, GlobalSignalHub
- [State Lifecycle](references/state-lifecycle.md) — UniState patterns, state definition, transitions, payloads
- [Scene Service](references/scene-service.md) — TransitionMode, ChangeSceneAsync, AutoHideLoading

## Decision Tree

```
What are you implementing?
├── Registering a dependency?          → di-patterns.md
├── Calling a service?                 → services-reference.md
├── Async operation / loading?         → unitask-patterns.md
├── Observable state / UI binding?     → r3-patterns.md
├── Cross-component event?             → signals-reference.md
├── Adding/modifying a game state?     → state-lifecycle.md
└── Loading a scene / flow?            → scene-service.md
```

## Service vs Game Logic

**Services** (`Assets/Scripts/Services/`) are **global infrastructure only**: Scene, UI, Audio, Blueprint, Haptic, Localization, LocalData, GlobalPool, Addressable. Registered as Singleton in `RootLifetimeScope`.

**Game logic** (Combat, Inventory, Quest, etc.) goes in **scene-local scopes**, not RootLifetimeScope.

```csharp
// WRONG
builder.Register<ICombatService, CombatService>(Lifetime.Singleton); // in RootLifetimeScope

// CORRECT
public class GameplayLifetimeScope : LifetimeScope
{
    protected override void Configure(IContainerBuilder builder)
    {
        builder.Register<CombatManager>(Lifetime.Scoped);
        builder.RegisterEntryPoint<GameplayController>();
    }
}
```

Game modules communicate via `IGlobalSignalHub` signals, not by injecting each other directly.

## Coding Standards

- **Language**: English only — code, comments, logs
- **Logging**: `[ComponentName] Message`. No logs in Update loops.
- **Async**: Always `UniTask`, never `Task`. Always pass `CancellationToken` for long operations.
- **Disposal**: Always `.AddTo(this)` or `.AddTo(disposables)` on R3/MessagePipe subscriptions.

## Commit Convention

```
<type>(<scope>): <subject>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`
Scopes: `core`, `di`, `ui`, `gameplay`, `state`, `messaging`, `pool`, `deps`
