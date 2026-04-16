---
name: scaffold
description: Scaffold new foundation components - service, signal, state, UI view, blueprint, or local data. Use when user asks to create/add a new component following project patterns.
user-invocable: true
argument-hint: [type] [name]
---

# Scaffold Component

Create a new component following Afterhours Foundation patterns.

**Usage**: `/scaffold <type> <name>`

## Supported Types

### `service` — New Global Service (interface + impl + DI registration)

**IMPORTANT**: Services are for **global infrastructure only** (Audio, Analytics, Ads, etc.). Game logic modules (Combat, Inventory, etc.) should NOT be services — use `/scaffold module` instead.

1. Create `Assets/Scripts/Services/{Name}Service/I{Name}Service.cs` (namespace `Afterhours.Services`)
2. Create `Assets/Scripts/Services/{Name}Service/{Name}Service.cs` (constructor injection)
3. Register in `Assets/Scripts/DI/RootLifetimeScope.cs`:
   - Plain class: `builder.Register<I{Name}Service, {Name}Service>(Lifetime.Singleton);`
   - MonoBehaviour: `builder.RegisterComponentOnNewGameObject<{Name}Service>(Lifetime.Singleton, "[{Name}]").As<I{Name}Service>();`

### `module` — New Game Logic Module (scene-scoped)

For gameplay systems (Combat, Inventory, Quest, etc.) that should NOT be global services.

1. Create `Assets/Scripts/Gameplay/{Name}/{Name}Manager.cs` (or appropriate game namespace)
2. Use constructor injection for dependencies (services, signalHub)
3. Register in the appropriate **scene-local scope** (e.g., `GameplayLifetimeScope`):
   - `builder.Register<{Name}Manager>(Lifetime.Scoped);`
4. Communicate with other modules via signals, not direct injection

### `signal` — New ISignal Struct

1. Determine file: existing `*Signals.cs` or new `Assets/Scripts/Signals/{Domain}Signals.cs`
2. Add struct implementing `ISignal` (namespace `Afterhours.Signals`)
3. No registration needed — auto-discovered

### `state` — New UniState State

1. Create `Assets/Scripts/Core/States/{Name}State.cs` (namespace `Afterhours.Core`)
2. Inherit `StateBase` (no payload) or `StateBase<TPayload>` (with payload)
3. Implement Initialize, Execute, Exit
4. Register in `RootLifetimeScope`: `builder.Register<{Name}State>(Lifetime.Transient);`

### `ui` — New Screen/Popup (Presenter-First MVP)

All UI screens use Presenter-first MVP pattern.

1. Ask: Screen or Popup?
2. Create **View** (dumb): `Assets/Scripts/UI/{Name}/UI{Name}.cs` (namespace `Afterhours.UI`)
   - Screen: inherit `UISceneView`
   - Popup: inherit `UIPopupView`
   - Expose UI elements as public properties, no `[Inject]`, no business logic
3. Create **Presenter**: `Assets/Scripts/UI/{Name}/{Name}Presenter.cs`
   - Screen: inherit `ScreenPresenter<TView>` or `ScreenPresenter<TView, TModel>`
   - Popup: inherit `PopupPresenter<TView>` or `PopupPresenter<TView, TModel>`
   - Add `[ScreenInfo("AddressableKey")]` attribute
   - Constructor injection for services: `public {Name}Presenter(IGlobalSignalHub signalHub, ...) : base(signalHub)`
   - Override `OnShow()` for signal subscriptions, data binding
4. Create **Model** (if needed): struct implementing `IUIModel` with data fields
5. Register Presenter in `RootLifetimeScope`: `builder.Register<{Name}Presenter>(Lifetime.Transient);`
6. Remind user to create prefab with UIView component and add to Addressables

### `blueprint` — New BlueprintBase SO

1. Create `Assets/Scripts/Blueprints/{Name}.cs` (namespace `Afterhours.Blueprints`)
2. Inherit from `BlueprintBase` with `[CreateAssetMenu]`
3. Remind user to create SO asset and label as "Blueprint" in Addressables

### `local-data` — New ILocalData Class

1. Create in `Assets/Scripts/Services/LocalDataService/` (namespace `Afterhours.Services`)
2. Implement `ILocalData` with `Init()` and `OnDataLoaded()`
3. Auto-registered via `RegisterLocalData()` reflection — no manual registration
4. Access via `ILocalDataService.Get<T>()`

## Rules for All Scaffolds

- English only in code and comments
- Constructor injection over `[Inject]`
- All async methods return `UniTask` with `CancellationToken`
- Structured logging: `[{ComponentName}] Message`
- No unnecessary comments or boilerplate

Parse `$ARGUMENTS` as: first word = type, rest = name.
