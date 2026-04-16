# UniTask Patterns

## Rules

- Always `UniTask` or `UniTask<T>`, never `Task`
- Always pass `CancellationToken` for cancellable operations
- Use `UniTaskVoid` for fire-and-forget (Start, event handlers)
- Use `.Forget()` when intentionally discarding the task

## Basic Patterns

```csharp
// Delay
await UniTask.Delay(1000); // 1 second
await UniTask.Delay(TimeSpan.FromSeconds(0.5f));

// Wait for condition
await UniTask.WaitUntil(() => isReady, cancellationToken: ct);
await UniTask.WaitUntilCanceled(ct); // Block until cancelled

// Wait frames
await UniTask.Yield();              // Next frame
await UniTask.DelayFrame(5);        // 5 frames

// Fire-and-forget
async UniTaskVoid Start()
{
    await InitializeAsync(this.GetCancellationTokenOnDestroy());
}
```

## Cancellation

```csharp
// MonoBehaviour: auto-cancel on destroy
var ct = this.GetCancellationTokenOnDestroy();
await SomeOperation(ct);

// Manual cancellation
var cts = new CancellationTokenSource();
cts.CancelAfter(TimeSpan.FromSeconds(10)); // Timeout
await SomeOperation(cts.Token);

// UniState: token passed to Initialize/Execute/Exit
public override async UniTask Initialize(CancellationToken token)
{
    await LoadAssets(token);
}
```

## Parallel Operations

```csharp
// Wait all (tuple destructuring)
var (tex, audio, prefab) = await UniTask.WhenAll(
    LoadTextureAsync("path1"),
    LoadAudioAsync("path2"),
    LoadPrefabAsync("path3")
);

// Wait any (first to complete)
var (winIndex, _) = await UniTask.WhenAny(
    WaitForInput(ct),
    UniTask.Delay(5000, cancellationToken: ct)
);
```

## Common Mistakes

```csharp
// WRONG: Using Task
public async Task BadMethod() { }

// WRONG: Missing cancellation token
public async UniTask LoadData() { await UniTask.Delay(1000); }

// CORRECT:
public async UniTask LoadData(CancellationToken ct)
{
    await UniTask.Delay(1000, cancellationToken: ct);
}

// WRONG: Mixing coroutines with UniTask
IEnumerator BadCoroutine() { yield return someUniTask.ToCoroutine(); }

// CORRECT: Use UniTask consistently
async UniTask GoodMethod() { await someUniTask; }
```
