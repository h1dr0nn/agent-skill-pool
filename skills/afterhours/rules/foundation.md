# Afterhours Foundation

Unity 6.x project template with clean architecture for mid-to-large-scale games.

## Tech Stack

| Package | Purpose |
|---------|---------|
| VContainer | Dependency Injection |
| UniTask | Async/Await (not Task) |
| R3 | Reactive Extensions |
| MessagePipe | Pub/Sub via IGlobalSignalHub |
| UniState | State Machine (Splash → Lobby → Gameplay) |
| uPools | Object Pooling |
| PrimeTween | Tweening/Animation |
| Addressables | Asset loading |
| MackySoft SerializeReferenceExt | Inspector polymorphism |

## Architecture

- **DI**: `RootLifetimeScope` (project-wide singleton) + scene-local scopes
- **Game Flow**: `GlobalStateController` → SplashState → LobbyState → GameplayState
- **Services**: Interface + Implementation pattern, registered as Singleton in DI
- **Signals**: Struct implementing `ISignal`, auto-registered via reflection
- **UI**: Presenter-first MVP — `UIService → Presenter → View`. Views are dumb, Presenters own business logic. Pluggable animations via UIAnimationModule.

## Key Directories

```
Assets/Scripts/
├── Core/           # States (Splash, Lobby, Gameplay), IO system
├── DI/             # Lifetime scopes, IDependencyContainer
├── Services/       # All services (Scene, UI, Blueprint, Audio, Haptic, LocalData, GlobalState, GlobalPool, Addressable, Localization)
├── Signals/        # ISignal structs (GameSignals, GameFlowSignals, InputSignals, UISignals)
├── UI/             # MVP: Core (UIView, UISceneView, UIPopupView), Core/MVP (Presenters, Model), Core/Animation, per-screen folders
├── Input/          # ScreenInputHandler
├── Blueprints/     # IBlueprintData, BlueprintBase
├── Camera/         # CameraController2D
├── Gameplay/Test/  # Demo components (DraggableCube, PoolTest)
├── Attributes/     # Custom inspector attributes
├── Editor/         # Drawers, IO editors, toolbar/hierarchy extensions
├── TableView/      # IMGUI table renderer with CSV export
└── Utils/          # Extensions, AssetLoader, EncryptedPlayerPrefs, LogService, Constants
```

## Rules

- Constructor injection over `[Inject]` attribute
- All async → `UniTask` (never `Task`)
- Always `.AddTo(this)` on subscriptions
- Signals are structs implementing `ISignal`
- English only in code, comments, logs
- Structured logging: `[ComponentName] Message`
- Commit format: `type(scope): subject`
- **Services are global only** — Scene, UI, Audio, Network, etc. Do NOT create services for game logic modules
- **Game logic uses plain classes/MonoBehaviours** registered in scene-local scopes or composed via DI. Keep gameplay modular without promoting everything to a global service
- **UI Views are dumb** — no `[Inject]`, no service references, no business logic in Views. All logic in Presenters.
- **UI Presenters own Views** — `UIService → Presenter → View`. Presenters registered as Transient, UIService manages caching.
- **`[ScreenInfo("key")]`** attribute on every Presenter maps to Addressable prefab key
