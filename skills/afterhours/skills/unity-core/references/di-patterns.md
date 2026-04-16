# VContainer - Dependency Injection Patterns

## Root Scope (Project-wide)

`RootLifetimeScope` is registered in VContainerSettings as project-wide scope. Persists across scenes (DDOL).

### Current Registration

```csharp
// MessagePipe (auto-register all ISignal structs via reflection)
var options = builder.RegisterMessagePipe();
builder.RegisterAllSignals(options);
builder.Register<GlobalSignalHub>(Lifetime.Singleton).As<IGlobalSignalHub>();

// Services (all Singleton)
builder.Register<ISceneService, SceneService>(Lifetime.Singleton);
builder.Register<IUIService, UIService>(Lifetime.Singleton);
builder.Register<IAddressableService, AddressableService>(Lifetime.Singleton);
builder.Register<BlueprintService>(Lifetime.Singleton).AsImplementedInterfaces();
builder.Register<IAudioService, AudioService>(Lifetime.Singleton);
builder.RegisterLocalData(); // Auto-registers all ILocalData types + ILocalDataService + IStorageProvider
builder.Register<ILocalizationService, LocalizationService>(Lifetime.Singleton);
builder.Register<IHapticService, HapticService>(Lifetime.Singleton);
builder.Register<TimescaleService>(Lifetime.Singleton).AsImplementedInterfaces();

// Global State
builder.Register<GlobalStateController>(Lifetime.Singleton).AsImplementedInterfaces().AsSelf();

// Pooling (MonoBehaviour)
builder.RegisterComponentOnNewGameObject<GlobalPoolService>(Lifetime.Singleton, "[GlobalPooling]").As<IGlobalPoolService>();

// States (Transient — new instance per transition)
builder.Register<SplashState>(Lifetime.Transient);
builder.Register<LobbyState>(Lifetime.Transient);
builder.Register<GameplayState>(Lifetime.Transient);
```

### Scene Scopes

- `SplashLifetimeScope` — registers UILoadingBar component
- `LobbyLifetimeScope` — empty (extend for lobby-specific dependencies)
- `GameplayLifetimeScope` — empty (extend for gameplay-specific dependencies)
- `LoadingLifetimeScope` — empty

### Service vs Game Logic Scope

**RootLifetimeScope** = global services only (Scene, UI, Audio, Network, etc.)
**Scene scopes** = game logic modules (Combat, Inventory, Quest, etc.)

```csharp
// Game logic goes in scene scope, NOT RootLifetimeScope
public class GameplayLifetimeScope : LifetimeScope
{
    protected override void Configure(IContainerBuilder builder)
    {
        builder.Register<CombatManager>(Lifetime.Scoped);
        builder.Register<WaveSpawner>(Lifetime.Scoped);
        builder.RegisterEntryPoint<GameplayController>();
    }
}
```

Game modules communicate via `IGlobalSignalHub` signals, not by injecting each other directly.

## Injection Rules

```csharp
// CORRECT: Constructor injection (preferred)
public class MyService
{
    private readonly ISceneService sceneService;
    public MyService(ISceneService sceneService) => this.sceneService = sceneService;
}

// ACCEPTABLE: [Inject] on MonoBehaviour (no constructor injection available)
public class MyUI : MonoBehaviour
{
    [Inject] private IUIService uiService;
}

// ACCEPTABLE: Method injection for MonoBehaviour setup
public class MyUI : MonoBehaviour
{
    [Inject]
    public void Construct(IUIService uiService) { }
}

// WRONG: [Inject] on plain classes that support constructor injection
public class BadService
{
    [Inject] private ISceneService sceneService; // Use constructor instead
}
```

## Lifetime Guide

| Lifetime | When | Example |
|----------|------|---------|
| Singleton | One instance for app lifetime | Services, managers |
| Scoped | One instance per scope | Scene-specific controllers |
| Transient | New instance per resolve | States, factories |

## Entry Points

```csharp
// Instead of MonoBehaviour Start/Update, use VContainer entry points:
public class GameInit : IStartable { void IStartable.Start() { } }
public class GameLoop : ITickable { void ITickable.Tick() { } }
public class AsyncInit : IAsyncStartable { async UniTask IAsyncStartable.StartAsync(CancellationToken ct) { } }

// Register:
builder.RegisterEntryPoint<GameInit>();
```
