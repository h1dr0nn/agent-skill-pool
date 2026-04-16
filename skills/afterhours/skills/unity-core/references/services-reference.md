# Services Reference

All services are registered as Singleton in `RootLifetimeScope`.

## ISceneService

```csharp
public enum TransitionMode { Direct, Smooth, Full }

UniTask ChangeSceneAsync(string sceneName, TransitionMode mode = Smooth, IProgress<float> progress = null, float minDuration = 0f);
```

- **Direct**: Instant load, no loading UI
- **Smooth**: Shows UILoadingScene overlay, auto-hides on SceneLoadCompletedSignal
- **Full**: Loads via intermediate 4.LoadingScene

## IUIService (Presenter-First MVP)

```csharp
ReadOnlyReactiveProperty<bool> IsAnyScreenOpen { get; }
ReadOnlyReactiveProperty<int> ActivePopupCount { get; }

// Screen (Presenter-first — no string key, read from [ScreenInfo] attribute)
UniTask<TPresenter> ShowSceneAsync<TPresenter>() where TPresenter : class, IScreenPresenter;
UniTask<TPresenter> ShowSceneAsync<TPresenter, TModel>(TModel model) where ...;

// Popup
UniTask<TPresenter> ShowPopupAsync<TPresenter>(PopupMode mode = Overlay) where TPresenter : class, IPopupPresenter;
UniTask<TPresenter> ShowPopupAsync<TPresenter, TModel>(TModel model, PopupMode mode = Overlay) where ...;

// Lifecycle
UniTask PreloadAsync<TPresenter>() where TPresenter : class, IUIPresenter;
UniTask HideCurrentSceneAsync();
UniTask HidePopupAsync<TPresenter>() where TPresenter : class, IPopupPresenter;
UniTask HideAllPopupsAsync();
void ShowAll();
void HideAll();
void CleanUpAll();
```

`PopupMode.Overlay` (default): multiple popups stack. `PopupMode.NonOverlay`: queued, one at a time.
Signal-based close: `signalHub.Publish(new ClosePopupRequestSignal(typeof(SettingsPresenter)))`.
Presenters registered as Transient in RootLifetimeScope. UIService manages caching.

## IBlueprintService

```csharp
UniTask InitializeAsync(CancellationToken ct = default);
T GetData<T>(string id) where T : class, IBlueprintData;            // O(1) lookup
IReadOnlyList<T> GetAllData<T>() where T : class, IBlueprintData;
T GetBlueprint<T>(string id) where T : BlueprintBase;
UniTask<T[]> LoadCsvTableAsync<T>(string address) where T : class, IBlueprintData;
UniTask<T> LoadJsonDataAsync<T>(string address) where T : class, IBlueprintData;
```

Auto-loads SOs labeled "Blueprint" in Addressables on startup.

## IAddressableService

```csharp
UniTask<T> LoadAssetAsync<T>(string key) where T : Object;
UniTask<IList<T>> LoadAssetsByLabelAsync<T>(string label) where T : Object;
void ReleaseAsset<T>(T asset) where T : Object;
```

## ILocalDataService

```csharp
// Structured data (ILocalData)
UniTask LoadAllAsync();
UniTask SaveAsync<T>(T data) where T : class, ILocalData;
UniTask SaveAllAsync();
T Get<T>() where T : class, ILocalData;

// Primitive key-value
void SetInt(string key, int value);
int GetInt(string key, int defaultValue = 0);
void SetString(string key, string value);
string GetString(string key, string defaultValue = "");
void SetBool(string key, bool value);
bool GetBool(string key, bool defaultValue = false);
void Save();
```

Backend: `IStorageProvider` → `LocalPrefsStorageProvider` (Neonagee LocalPrefs, file-based, Rijndael AES-256).
Auto-discovers `ILocalData` implementations via reflection. Publishes `UserDataLoadedSignal` after load.

## IHapticService

```csharp
void PlayPreset(HapticPreset preset);  // Success, Warning, Failure, Light, Medium, Heavy, Rigid, Soft, Selection
void PlayContinuous(float intensity, float sharpness, float duration);
void Stop();
bool IsSupported();
```


## IAudioService

Manages audio clips and playback via SoundEmitter pooling.

## ILocalizationService

Wraps Unity Localization package.

## IGlobalPoolService

```csharp
GameObject Rent(GameObject prefab);
void Return(GameObject instance);
void Prewarm(GameObject prefab, int count);
Transform GetPoolContainer(GameObject prefab);
```

## IGlobalStateController

```csharp
StateMachine StateMachine { get; }
UniTask StartAsync(CancellationToken ct);
UniTask TransitionTo<T>(object payload = null) where T : class, IExecutableState;
```

Detects active scene on startup, starts corresponding state (Splash/Lobby/Gameplay).

