---
name: review
description: Review code against Afterhours Foundation standards - DI patterns, async correctness, disposal, naming, architecture. Use when user asks to review or check code quality.
user-invocable: true
argument-hint: [file-or-directory]
---

# Code Review

Review code against Afterhours Foundation standards.

**Usage**: `/review [path]` — reviews specified file/directory, or recent changes if no path given.

## Review Checklist

### DI & Architecture
- [ ] Constructor injection used (not `[Inject]` on plain classes)
- [ ] `[Inject]` only on MonoBehaviour where constructor injection isn't available
- [ ] Services registered with correct lifetime (Singleton for services, Transient for states)
- [ ] No service locator pattern or static access to services
- [ ] Interface + Implementation pair for new services

### Async
- [ ] `UniTask` used (never `Task` or `Task<T>`)
- [ ] `CancellationToken` passed to long-running operations
- [ ] `UniTaskVoid` for fire-and-forget (not `async void`)
- [ ] `.Forget()` used intentionally when discarding tasks
- [ ] No `await` in Update loops without throttling

### Reactive & Signals
- [ ] All subscriptions have `.AddTo(this)` or `.AddTo(disposables)`
- [ ] No naked `.Subscribe()` without disposal
- [ ] Signals are structs implementing `ISignal`
- [ ] `IGlobalSignalHub` used (not direct `IPublisher`/`ISubscriber`)
- [ ] Prefer `signalHub.Receive<T>(handler).AddTo(this)` shorthand for simple subscriptions
- [ ] Use `Receive<T>().Subscribe()` chain only when filtering/transforming is needed
- [ ] `CompositeDisposable` cleared in `OnHide()` for UI views

### UI (Presenter-First MVP)
- [ ] All screens go through Presenters — no business logic in Views
- [ ] Views are dumb — only expose UI elements as public, no `[Inject]` on views
- [ ] Presenter has `[ScreenInfo("key")]` attribute mapping to Addressable prefab
- [ ] Presenter extends `ScreenPresenter<TView>` or `PopupPresenter<TView>` (not raw IUIPresenter)
- [ ] Presenter registered as `Transient` in `RootLifetimeScope`
- [ ] Presenter uses `Disposables` for subscriptions (auto-cleared in HideAsync)
- [ ] Popup close logic in PopupPresenter (`RequestClose`, `OnCloseRequested`), NOT in View
- [ ] Dimmer config in PopupPresenter (`UseDimmedBackground`, `DimmerColor`), NOT in View
- [ ] PrimeTween used for animations via `UIAnimationModule` (not DOTween or coroutine)
- [ ] UI loaded via Addressables (not direct references)

### Data
- [ ] `IBlueprintData.Index` properly implemented
- [ ] `ILocalData.Init()` sets sensible defaults
- [ ] No raw PlayerPrefs — use `ILocalDataService` or `LocalPrefs`

### Code Quality
- [ ] English only (code, comments, logs)
- [ ] Structured logging: `[ComponentName] Message`
- [ ] No obvious/redundant comments
- [ ] No logs in Update/Tick loops
- [ ] Consistent naming (PascalCase public, camelCase private)
- [ ] No unused `using` statements

### Common Anti-patterns
- Using `Task` instead of `UniTask`
- `Transition.Stay()` (doesn't exist — use `WaitUntilCanceled`)
- Manual `RegisterMessageBroker` (use auto-registration via `ISignal`)
- Direct `ISubscriber<T>` injection (use `IGlobalSignalHub.Receive<T>()` instead)
- `Coroutine` / `IEnumerator` (use `UniTask`)
- `DOTween` (use `PrimeTween`)
- Direct `PlayerPrefs` (use `ILocalDataService` or `LocalPrefs`)
- `LoadSceneAsync` directly (use `ISceneService.ChangeSceneAsync`)
- `AfterhoursAudio.Play()` in Presenters/States (use `IAudioService` via DI — direct calls OK only in scene components like `SoundSource`)

## Output Format

For each issue found:
1. File and line reference
2. What's wrong
3. How to fix (with code example)

Prioritize: errors > warnings > suggestions.
