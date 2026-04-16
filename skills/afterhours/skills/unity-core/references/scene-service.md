# SceneService - Scene Management

## TransitionMode

| Mode | Behavior |
|------|----------|
| `Direct` | Instant `SceneManager.LoadSceneAsync`. No loading UI. |
| `Smooth` | Shows UILoadingScene overlay (sortingOrder 999) → loads scene → waits for `SceneLoadCompletedSignal` → hides overlay |
| `Full` | Shows UILoadingScene → loads intermediate `4.LoadingScene` → loads target scene |

## API

```csharp
await sceneService.ChangeSceneAsync(
    SceneNames.Gameplay,           // Scene name
    TransitionMode.Smooth,         // Transition mode
    progress,                      // Optional IProgress<float>
    minDuration: 3f                // Optional minimum load time
);
```

## How Smooth/Full Works

1. `SceneService` shows `UILoadingScene` as generic overlay
2. Starts background `AutoHideLoading(sceneName)` task
3. Loads the target scene
4. **The state/bootstrapper must publish `SceneLoadCompletedSignal`** when ready:
   ```csharp
   signalHub.Publish(new SceneLoadCompletedSignal(SceneNames.Gameplay));
   ```
5. `AutoHideLoading` receives the signal, waits 200ms buffer, hides loading UI
6. 30-second timeout safety: hides loading UI if signal never arrives

## Progress Tracking

```csharp
var progress = new Progress<float>(p =>
{
    signalHub.Publish(new LoadingProgressSignal(p, "Loading..."));
});

await sceneService.ChangeSceneAsync("Scene", TransitionMode.Smooth, progress, minDuration: 3f);
```

Progress blends real scene load progress with fake progress over `minDuration`.

## Pattern: State Loading a Scene

```csharp
public override async UniTask Initialize(CancellationToken token)
{
    var mode = Payload; // TransitionMode from previous state

    // 1. Load scene (SceneService handles loading UI for Smooth/Full)
    await sceneService.ChangeSceneAsync(SceneNames.Lobby, mode);

    // 2. Show UI (while loading overlay still covers)
    await uiService.ShowSceneAsync<LobbyPresenter>();

    // 3. Signal ready → SceneService auto-hides loading UI
    signalHub.Publish(new SceneLoadCompletedSignal(SceneNames.Lobby));
}
```
