# UI API — Presenter-First MVP

## Dependency Flow

```
UIService → Presenter → View (MonoBehaviour)
                │
                └── Model (data struct)
```

## IUIService

```csharp
public interface IUIService
{
    ReadOnlyReactiveProperty<bool> IsAnyScreenOpen { get; }
    ReadOnlyReactiveProperty<int> ActivePopupCount { get; }

    // Screen (Presenter-first)
    UniTask<TPresenter> ShowSceneAsync<TPresenter>() where TPresenter : class, IScreenPresenter;
    UniTask<TPresenter> ShowSceneAsync<TPresenter, TModel>(TModel model)
        where TPresenter : class, IScreenPresenter<TModel> where TModel : IUIModel;

    // Popup (Presenter-first)
    UniTask<TPresenter> ShowPopupAsync<TPresenter>(PopupMode mode = Overlay) where TPresenter : class, IPopupPresenter;
    UniTask<TPresenter> ShowPopupAsync<TPresenter, TModel>(TModel model, PopupMode mode = Overlay)
        where TPresenter : class, IPopupPresenter<TModel> where TModel : IUIModel;

    // Lifecycle
    UniTask PreloadAsync<TPresenter>() where TPresenter : class, IUIPresenter;
    UniTask HideCurrentSceneAsync();
    UniTask HidePopupAsync<TPresenter>() where TPresenter : class, IPopupPresenter;
    UniTask HideAllPopupsAsync();
    bool IsAnyPopupOpen();
    void ShowAll();
    void HideAll();
    void CleanUpAll();
}
```

No string key in API — Addressable key read from `[ScreenInfo]` attribute on Presenter.

## PopupMode

```csharp
public enum PopupMode
{
    Overlay,     // Multiple popups stack simultaneously (default)
    NonOverlay   // Queued: only one shown at a time, next auto-opens on close
}
```

## View Base Classes

Views are **dumb** — expose UI elements and animation hooks only. No service injection, no business logic.

### UIView (base)

```csharp
[RequireComponent(typeof(CanvasGroup))]
public abstract class UIView : MonoBehaviour
{
    public RectTransform RectTransform { get; }
    public virtual void Show();                       // CanvasGroup alpha=1
    public virtual void Hide();                       // CanvasGroup alpha=0
    public virtual UniTask PlayShowAnimation();       // Override for animations
    public virtual UniTask PlayHideAnimation();       // Override for animations
}
```

### UISceneView — Fullscreen Scenes

```csharp
public abstract class UISceneView : UIView
{
    public event Action OnBackPressed;  // ESC key / Android back button
}
```

### UIPopupView — Modal Popups

Supports pluggable open/close animations via `UIAnimationModule`.

```csharp
public class UIPopupView : UIView
{
    public Button CloseButton { get; }                        // Exposed for Presenter
    [SerializeField] UIAnimationModule openAnimation;         // Pluggable
    [SerializeField] UIAnimationModule closeAnimation;        // Pluggable
}
```

Dimmer config, close logic, and outside-click handling are in **PopupPresenter**, not the View.

## Presenter Interfaces

```csharp
public interface IUIPresenter : IDisposable
{
    UIView View { get; }
    ScreenStatus Status { get; }
    bool IsVisible { get; }
    void SetView(UIView view);
    void SetViewParent(Transform parent);
    UniTask ShowAsync();
    UniTask HideAsync();
    void HideImmediate();
}

public interface IUIPresenter<in TModel> : IUIPresenter where TModel : IUIModel
{
    UniTask ShowAsync(TModel model);
}

// Markers for layer routing
public interface IScreenPresenter : IUIPresenter { }
public interface IPopupPresenter : IUIPresenter
{
    bool UseDimmedBackground { get; }
    bool CloseOnOutsideClick { get; }
    Color DimmerColor { get; }
    void RequestClose();
    event Action OnClosed;
}
```

## Presenter Base Classes

### ScreenPresenter

```csharp
[ScreenInfo("UIShopScene")]
public class ShopPresenter : ScreenPresenter<ShopView>
{
    public ShopPresenter(IGlobalSignalHub signalHub) : base(signalHub) { }

    protected override void OnViewReady() { }   // Once, after View bound
    protected override void OnShow() { }         // Each show — subscribe signals, bind data
    protected override void OnHide() { }         // Each hide — Disposables auto-cleared before this
}
```

### ScreenPresenter with Model

```csharp
public class ShopPresenter : ScreenPresenter<ShopView, ShopModel>
{
    public ShopPresenter(IGlobalSignalHub signalHub) : base(signalHub) { }

    protected override void OnBindModel(ShopModel model)
    {
        // Bind model data to View elements
        View.PriceText.text = model.Price.ToString();
    }
}
```

### PopupPresenter

```csharp
[ScreenInfo("UISettingsPopup")]
public class SettingsPresenter : PopupPresenter<UISettingsView>
{
    public override bool UseDimmedBackground => true;
    public override bool CloseOnOutsideClick => true;

    public SettingsPresenter(IGlobalSignalHub signalHub) : base(signalHub) { }

    protected override void OnShow()
    {
        View.CloseButton.OnClickAsObservable()
            .Subscribe(_ => RequestClose())
            .AddTo(Disposables);
    }
}
```

### ItemPresenter (for dynamic lists)

```csharp
public class InventorySlotPresenter : ItemPresenter<InventorySlotView, ItemData>
{
    public InventorySlotPresenter(IAddressableService addressableService) : base(addressableService) { }

    public override void BindData(ItemData data)
    {
        View.Icon.sprite = data.Icon;
        View.NameText.text = data.Name;
    }
}
```

## Model

```csharp
public interface IUIModel { }

public struct ShopModel : IUIModel
{
    public List<ShopItem> Items;
    public int PlayerGold;
}
```

## ScreenInfo Attribute

```csharp
[ScreenInfo("UIShopScene")]           // Maps presenter to Addressable prefab key
[PopupInfo("UISettings", enableDimmed: true, closeOnOutsideClick: true)]  // Extended for popups
```

## Animation System

Pluggable `UIAnimationModule` attached to Views (not Presenters):

```csharp
public abstract class UIAnimationModule : MonoBehaviour
{
    public abstract void ResetState();
    public abstract void Prepare();
    public abstract UniTask Play(bool isForward);
    public abstract void Kill();
}
```

Built-in: `UIFadeAnimation`, `UIScaleAnimation`, `UISlideAnimation` (all PrimeTween-based).

## Utilities

- `CanvasGroupExtensions` — `Show()`, `Hide()`, `SetVisible()` extensions
- `SafeArea` — Notch support for mobile devices

## UI Common Components

### UIButtonToggle
Toggle switch with animated dot, background color, and ON/OFF text:
```csharp
ReadOnlyReactiveProperty<bool> IsOn { get; }
void SetState(bool state, bool animate = true);
void Toggle();
```

### ScrollViewAutoScroll
Auto-scrolls a ScrollRect to top or bottom with PrimeTween animation.

### UIRotator
Rotates a transform continuously using PrimeTween. Used for loading spinners.
