# UniState - State Machine Patterns

## State Lifecycle

1. `Initialize(CancellationToken)` — Load resources, setup UI
2. `Execute(CancellationToken)` → `StateTransitionInfo` — Main logic, return transition
3. `Exit(CancellationToken)` — Cleanup, hide UI
4. `Dispose()` — Release all resources

## State Without Payload

```csharp
public class SplashState : StateBase
{
    private readonly ISceneService sceneService;

    public SplashState(ISceneService sceneService)
    {
        this.sceneService = sceneService;
    }

    public override async UniTask Initialize(CancellationToken token) { }

    public override async UniTask<StateTransitionInfo> Execute(CancellationToken token)
    {
        return Transition.GoTo<LobbyState, TransitionMode>(TransitionMode.Direct);
    }

    public override async UniTask Exit(CancellationToken token) { }
}
```

## State With Payload

```csharp
public class LobbyState : StateBase<TransitionMode>
{
    public override async UniTask Initialize(CancellationToken token)
    {
        var mode = Payload; // Access TransitionMode passed from previous state
        await sceneService.ChangeSceneAsync(SceneNames.Lobby, mode);
    }
}
```

## Transitions

```csharp
Transition.GoTo<NextState>()                           // No payload
Transition.GoTo<NextState, TPayload>(payload)          // With payload
Transition.GoBack()                                     // Return to previous state
```

**Note**: `Transition.Stay()` does NOT exist in UniState. To keep a state alive, await indefinitely:

```csharp
public override async UniTask<StateTransitionInfo> Execute(CancellationToken token)
{
    await UniTask.WaitUntilCanceled(token); // Stay alive
    return Transition.GoBack();
}
```

## Registration

States are **Transient** (new instance per transition):

```csharp
builder.Register<SplashState>(Lifetime.Transient);
builder.Register<LobbyState>(Lifetime.Transient);
builder.Register<GameplayState>(Lifetime.Transient);
```

## Starting the State Machine

```csharp
var stateMachine = new StateMachine();
stateMachine.SetResolver(container.ToTypeResolver());
await stateMachine.Execute<SplashState>(ct);           // No payload
await stateMachine.Execute<LobbyState, TransitionMode>(TransitionMode.Direct, ct); // With payload
```
