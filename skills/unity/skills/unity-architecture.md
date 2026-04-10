---
name: unity-architecture
description: ScriptableObject-first architecture, decoupled systems, data-driven design for scalable Unity projects. Use when designing game systems, refactoring MonoBehaviours, or setting up project structure.
---

# Unity Architecture

## When to Activate
- Designing new game systems or refactoring existing ones
- Setting up project structure for a new Unity project
- Breaking apart God classes or manager singletons
- Wiring cross-system communication
- Making systems designer-friendly

## Project Structure

```
Assets/
├── _Project/
│   ├── Scripts/
│   │   ├── Core/           # Singletons, managers, game loop
│   │   ├── Gameplay/       # Player, enemies, items, interactions
│   │   ├── UI/             # UI controllers, views
│   │   ├── Data/           # ScriptableObjects, configs
│   │   └── Utils/          # Helpers, extensions
│   ├── Prefabs/
│   ├── Scenes/
│   ├── ScriptableObjects/
│   │   ├── Variables/      # FloatVariable, IntVariable, etc.
│   │   ├── Events/         # GameEvent channels
│   │   ├── RuntimeSets/    # Active entity tracking
│   │   └── Config/         # Game settings, balance data
│   ├── Materials/
│   ├── Animations/
│   └── Audio/
├── Plugins/                # Third-party SDKs
└── Resources/              # Only for runtime-loaded assets
```

## ScriptableObject-First Design

All shared game data lives in ScriptableObjects, never in MonoBehaviour fields passed between scenes.

### FloatVariable SO

```csharp
[CreateAssetMenu(menuName = "Variables/Float")]
public class FloatVariable : ScriptableObject
{
    [SerializeField] private float _value;

    public float Value
    {
        get => _value;
        set
        {
            _value = value;
            OnValueChanged?.Invoke(value);
        }
    }

    public event Action<float> OnValueChanged;
    public void SetValue(float value) => Value = value;
    public void ApplyChange(float amount) => Value += amount;
}
```

### GameEvent Channel - Decoupled Messaging

```csharp
[CreateAssetMenu(menuName = "Events/Game Event")]
public class GameEvent : ScriptableObject
{
    private readonly List<GameEventListener> _listeners = new();

    public void Raise()
    {
        for (int i = _listeners.Count - 1; i >= 0; i--)
            _listeners[i].OnEventRaised();
    }

    public void RegisterListener(GameEventListener listener) => _listeners.Add(listener);
    public void UnregisterListener(GameEventListener listener) => _listeners.Remove(listener);
}

public class GameEventListener : MonoBehaviour
{
    [SerializeField] private GameEvent _event;
    [SerializeField] private UnityEvent _response;

    private void OnEnable() => _event.RegisterListener(this);
    private void OnDisable() => _event.UnregisterListener(this);
    public void OnEventRaised() => _response.Invoke();
}
```

### RuntimeSet - Singleton-Free Entity Tracking

```csharp
public abstract class RuntimeSet<T> : ScriptableObject
{
    public List<T> Items = new List<T>();
    public void Add(T item) { if (!Items.Contains(item)) Items.Add(item); }
    public void Remove(T item) { if (Items.Contains(item)) Items.Remove(item); }
}

[CreateAssetMenu(menuName = "Runtime Sets/Transform Set")]
public class TransformRuntimeSet : RuntimeSet<Transform> { }

public class RuntimeSetRegistrar : MonoBehaviour
{
    [SerializeField] private TransformRuntimeSet _set;
    private void OnEnable() => _set.Add(transform);
    private void OnDisable() => _set.Remove(transform);
}
```

## Architecture Workflow

### 1. Architecture Audit
- Identify hard references, singletons, God classes
- Map data flows: who reads what, who writes what
- Determine what should be SO vs scene instance

### 2. SO Asset Design
- Create variable SOs for shared runtime values (health, score, speed)
- Create event channel SOs for cross-system triggers
- Create RuntimeSet SOs for entity types needing global tracking

### 3. Component Decomposition
- Break God MonoBehaviours into single-responsibility components
- Wire components via SO references in Inspector, not code
- Validate every prefab can be placed in an empty scene without errors

### 4. Editor Tooling
- `CustomEditor` or `PropertyDrawer` for frequently used SO types
- `[ContextMenu]` shortcuts on SO assets
- Editor scripts that validate architecture rules on build

## Anti-Patterns

| Pattern | Problem | Solution |
|---------|---------|----------|
| God MonoBehaviour (500+ lines) | Unmaintainable | Split by responsibility |
| `DontDestroyOnLoad` singleton abuse | Memory leaks, tight coupling | RuntimeSet SO |
| `GetComponent<GameManager>()` | Tight coupling | SO event channels |
| Magic strings for tags/layers | Fragile, no compile-time checks | `const` or SO references |
| Logic in `Update()` | Wasteful polling | Event-driven via SO events |
| `GameObject.Find()` | Slow, fragile | Inspector-assigned SO refs |

## Scene Management

- One scene per major game state (Menu, Gameplay, Loading)
- Use additive scenes for shared systems (UI, Audio)
- Keep scenes lean - no persistent data in scene objects
- Every prefab must work in an isolated empty scene

## Advanced Patterns

### SO-Based State Machine
- States are SO assets, transitions are SO events
- State logic lives in SO methods
- Designer can create new states without code

### Addressables
- Replace `Resources.Load()` entirely
- Design groups by loading profile: preloaded vs on-demand vs DLC
- Async scene loading with progress tracking

### DOTS Hybrid
- ECS for performance-critical simulation
- MonoBehaviours for editor-friendly presentation
- Job System + Burst for CPU-bound batch operations
