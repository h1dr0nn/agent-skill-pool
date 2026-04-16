# R3 Reactive Patterns

## ReactiveProperty

```csharp
// Observable state
public ReactiveProperty<int> Health { get; } = new(100);
public ReadOnlyReactiveProperty<bool> IsDead { get; }

public Player()
{
    IsDead = Health
        .Select(hp => hp <= 0)
        .ToReadOnlyReactiveProperty();
}

// Subscribe with auto-dispose
Health.Subscribe(hp => UpdateUI(hp)).AddTo(this);
```

## Subject Types

| Type | Description | Use Case |
|------|-------------|----------|
| `Subject<T>` | Basic event emitter | Fire events |
| `BehaviorSubject<T>` | Has current value | State needing initial value |
| `ReactiveProperty<T>` | BehaviorSubject + distinct | UI binding, model properties |
| `ReplaySubject<T>` | Replays past values | Late subscribers need history |

## Observable Patterns

```csharp
// Frame-based
Observable.EveryUpdate()
    .Where(_ => Input.GetKeyDown(KeyCode.Space))
    .Subscribe(_ => Jump())
    .AddTo(this);

// Button click (R3 extension)
button.OnClickAsObservable()
    .Subscribe(_ => OnButtonClicked())
    .AddTo(disposals);

// Throttle (prevent spam)
signalHub.Receive<TapSignal>()
    .ThrottleFirst(TimeSpan.FromSeconds(0.5f))
    .Subscribe(HandleTap)
    .AddTo(this);

// Combine
health.CombineLatest(shield, (h, s) => h + s)
    .Subscribe(total => UpdateTotalHP(total))
    .AddTo(this);
```

## Disposal (CRITICAL)

```csharp
// ALWAYS dispose subscriptions. Choose one:

// Option 1: AddTo(MonoBehaviour) — auto-dispose on destroy
observable.Subscribe(...).AddTo(this);

// Option 2: AddTo(CompositeDisposable) — manual control
private readonly CompositeDisposable disposals = new();
observable.Subscribe(...).AddTo(disposals);
disposals.Clear();  // Reuse
disposals.Dispose(); // Final cleanup

// Option 3: AddTo(CancellationToken) — tie to token
observable.Subscribe(...).AddTo(token);

// WRONG: Memory leak
observable.Subscribe(x => DoSomething(x)); // No disposal!
```
