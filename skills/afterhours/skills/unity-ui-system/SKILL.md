---
name: unity-ui-system
description: Presenter-first MVP UI system — UIService manages Presenters, Views are dumb MonoBehaviours. Covers UIService API, MVP base classes, pluggable animations, PrimeTween. Load when working with UI screens, popups, or animations.
---

# UI System

This skill covers the Presenter-first MVP UI architecture and animation system.

- [UI API](references/ui-api.md) — UIService API, MVP hierarchy, View/Presenter/Model patterns
- [PrimeTween Patterns](references/primetween-patterns.md) — Tween, Sequence, Ease, CycleMode

## Architecture: Presenter-First MVP

```
UIService → Presenter → View (dumb MonoBehaviour)
                │
                └── Model (data/state)
```

```
RootCanvas (DontDestroyOnLoad)
├── SceneLayer    (sortingOrder 0)    — One active scene at a time
└── PopupLayer    (sortingOrder 100)  — Stacked modal overlays
    └── SharedDimmer                  — Auto-managed dimmed background
```

- **UIService** resolves Presenter → loads View prefab → binds → calls lifecycle
- **Presenter** owns View, handles business logic, subscribes to signals
- **View** is dumb — exposes UI elements and animation hooks, no service injection
- **Model** carries data/state passed when showing a screen

## Quick Reference

```csharp
// Show a fullscreen scene
await uiService.ShowSceneAsync<LobbyPresenter>();
await uiService.ShowSceneAsync<ShopPresenter, ShopModel>(model);

// Show popup
await uiService.ShowPopupAsync<SettingsPresenter>();
await uiService.ShowPopupAsync<RewardPresenter>(PopupMode.NonOverlay);
await uiService.ShowPopupAsync<RewardPresenter, RewardModel>(model, PopupMode.NonOverlay);

// Preload without showing
await uiService.PreloadAsync<LoadingPresenter>();

// Hide
await uiService.HidePopupAsync<SettingsPresenter>();
await uiService.HideAllPopupsAsync();
await uiService.HideCurrentSceneAsync();

// Signal-based close (no reference needed)
signalHub.Publish(new ClosePopupRequestSignal(typeof(SettingsPresenter)));
signalHub.Publish(new ClosePopupRequestSignal());       // top-most
signalHub.Publish(new CloseAllPopupsRequestSignal());
```

## Creating a New Screen (MVP)

```csharp
// 1. View — dumb MonoBehaviour on prefab
public class ShopView : UISceneView
{
    [SerializeField] private Button buyButton;
    public Button BuyButton => this.buyButton;
}

// 2. Presenter — plain C# class, constructor injection
[ScreenInfo("UIShopScene")]
public class ShopPresenter : ScreenPresenter<ShopView>
{
    readonly ISceneService sceneService;
    public ShopPresenter(IGlobalSignalHub signalHub, ISceneService sceneService) : base(signalHub)
    {
        this.sceneService = sceneService;
    }
    protected override void OnShow()
    {
        View.BuyButton.OnClickAsObservable().Subscribe(_ => Buy()).AddTo(Disposables);
    }
}

// 3. DI — register as Transient in RootLifetimeScope
builder.Register<ShopPresenter>(Lifetime.Transient);
```

Addressable key comes from `[ScreenInfo("key")]` on the Presenter class — no string key in API.
