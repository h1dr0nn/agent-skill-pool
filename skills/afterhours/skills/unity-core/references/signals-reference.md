# Signals Reference

## How Signals Work

1. Define a struct implementing `ISignal`
2. Auto-registered via reflection in `RootLifetimeScope` (`RegisterAllSignals`)
3. Publish/Subscribe via `IGlobalSignalHub`

## Built-in Signals

### Game Lifecycle (`GameSignals.cs`)

| Signal | Fields | When Published |
|--------|--------|----------------|
| `GameInitializedSignal` | — | After game initialization |
| `SceneLoadStartedSignal` | `string SceneName` | Scene load begins |
| `SceneLoadCompletedSignal` | `string SceneName` | Scene load completes (triggers AutoHideLoading) |
| `LoadingProgressSignal` | `float Progress`, `string Message` | During loading (0-1 range) |

### Game Flow (`GameFlowSignals.cs`)

| Signal | Fields | When Published |
|--------|--------|----------------|
| `GamePlayRequestSignal` | `TransitionMode Mode` | UI requests transition to Gameplay |
| `BackToLobbyRequestSignal` | `TransitionMode Mode` | UI requests transition to Lobby |

### Input (`InputSignals.cs`)

| Signal | Fields |
|--------|--------|
| `OnTapSignal` | `Vector2 ScreenPos`, `Vector3 WorldPos` |
| `OnDragStartSignal` | `Vector2 ScreenPos`, `Vector3 WorldPos` |
| `OnDragSignal` | `Vector2 Delta`, `Vector2 ScreenPos` |
| `OnDragEndSignal` | `Vector2 ScreenPos`, `Vector2 Velocity` |
| `OnPinchSignal` | `float DeltaScale`, `Vector2 Center` |
| `OnScrollZoomSignal` | `float Delta`, `Vector2 ScreenPos` |
| `OnObjectDragActiveSignal` | `bool IsActive` |

### UI (`UISignals.cs`)

| Signal | Fields | When Published |
|--------|--------|----------------|
| `ClosePopupRequestSignal` | `Type PresenterType` (null = top-most) | Request to close a specific popup by Presenter type |
| `CloseAllPopupsRequestSignal` | — | Request to close all popups |
| `UIScreenOpenedSignal` | `Type PresenterType` | After a screen/popup presenter is shown |
| `UIScreenClosedSignal` | `Type PresenterType` | After a screen/popup presenter is hidden |

### Local Data

| Signal | Fields | When Published |
|--------|--------|----------------|
| `UserDataLoadedSignal` | — | After all ILocalData loaded |

## Creating New Signals

```csharp
// In Assets/Scripts/Signals/{Domain}Signals.cs
namespace Afterhours.Signals
{
    public struct PlayerDiedSignal : ISignal
    {
        public readonly int PlayerId;
        public readonly Vector3 Position;

        public PlayerDiedSignal(int playerId, Vector3 position)
        {
            PlayerId = playerId;
            Position = position;
        }
    }
}
// No registration needed — auto-discovered via ISignal interface
```

## Publishing & Subscribing

```csharp
// Publishing
signalHub.Publish(new PlayerDiedSignal(1, transform.position));

// Subscribing (3 styles)
// 1. Shorthand with Action
signalHub.Receive<PlayerDiedSignal>(OnPlayerDied).AddTo(this);

// 2. Observable for filtering/transforming
signalHub.Receive<PlayerDiedSignal>()
    .Where(sig => sig.PlayerId == localPlayerId)
    .Subscribe(sig => HandleDeath(sig))
    .AddTo(this);

// 3. Async wait (one-shot)
var sig = await signalHub.Receive<PlayerDiedSignal>().FirstAsync(ct);
```
