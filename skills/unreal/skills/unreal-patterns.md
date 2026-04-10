---
name: unreal-patterns
description: Unreal Engine 5 architecture patterns - C++ and Blueprint best practices, gameplay framework, multiplayer, performance. Use when building UE5 projects.
---

# Unreal Engine 5 Patterns

## When to Activate
- Building Unreal Engine projects
- Designing gameplay systems architecture
- Working with C++ and Blueprints
- Multiplayer networking decisions
- Performance optimization

## Project Structure

```
Source/
├── MyGame/
│   ├── Core/               # Game instance, game mode, game state
│   ├── Characters/          # Player, NPCs, AI controllers
│   ├── Gameplay/            # Abilities, interactions, items
│   ├── UI/                  # UMG widgets, HUD
│   ├── Systems/             # Subsystems, managers
│   └── Utils/               # Helpers, libraries
Content/
├── Blueprints/
├── Maps/
├── Materials/
├── Meshes/
├── Animations/
├── Audio/
├── UI/
└── Data/                    # Data tables, curves, configs
```

## C++ vs Blueprint Decision

| Use C++ For | Use Blueprints For |
|------------|-------------------|
| Core gameplay systems | Rapid prototyping |
| Performance-critical logic | Designer-facing tweaks |
| Networking/replication | UI layout and animation |
| Complex math/algorithms | Level-specific scripting |
| Base classes | Child class overrides |
| Plugin development | Content configuration |

### Best Practice: C++ Base + Blueprint Child
```cpp
// C++ base with BlueprintCallable/BlueprintNativeEvent
UCLASS(Blueprintable)
class AMyCharacter : public ACharacter
{
    GENERATED_BODY()

    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "Stats")
    float MaxHealth = 100.f;

    UFUNCTION(BlueprintCallable, Category = "Combat")
    virtual void TakeDamage(float Amount);

    UFUNCTION(BlueprintNativeEvent, Category = "Combat")
    void OnDeath();
};
```

## Gameplay Framework

```
UGameInstance          -- persistent across map loads
  └── AGameMode        -- server-only rules, spawning
      └── AGameState   -- replicated match state
          └── APlayerState -- replicated per-player state
              └── APlayerController -- input, UI, camera
                  └── APawn/ACharacter -- physical presence
```

### Rules
- GameMode: server authority only, never access on client
- GameState: replicated data all clients need
- PlayerState: per-player data (score, team, name)
- PlayerController: owns input, HUD, camera logic
- Pawn/Character: physical movement, collision, animation

## Subsystem Pattern

```cpp
// Game Instance Subsystem - persists across maps
UCLASS()
class UInventorySubsystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()
public:
    virtual void Initialize(FSubsystemCollectionBase& Collection) override;

    UFUNCTION(BlueprintCallable)
    void AddItem(FName ItemId, int32 Count);
};

// Access from anywhere:
UInventorySubsystem* Inv = GetGameInstance()->GetSubsystem<UInventorySubsystem>();
```

## Enhanced Input System

```cpp
// Input Action binding
void AMyCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
    auto* EIC = CastChecked<UEnhancedInputComponent>(PlayerInputComponent);
    EIC->BindAction(MoveAction, ETriggerEvent::Triggered, this, &AMyCharacter::Move);
    EIC->BindAction(JumpAction, ETriggerEvent::Started, this, &AMyCharacter::StartJump);
}
```

## Gameplay Ability System (GAS)

| Component | Purpose |
|-----------|---------|
| AbilitySystemComponent | Grants/activates abilities |
| GameplayAbility | Individual ability logic |
| GameplayEffect | Stat modifications, buffs/debuffs |
| AttributeSet | Character stats (health, mana) |
| GameplayTags | Hierarchical labels for state |
| GameplayCue | Visual/audio feedback |

### Rules
- One AbilitySystemComponent per actor
- Use GameplayTags for state, not booleans
- GameplayEffects for any stat change (not direct mutation)
- Predict abilities client-side, confirm server-side

## Multiplayer / Replication

### Property Replication
```cpp
UPROPERTY(ReplicatedUsing = OnRep_Health)
float Health;

UFUNCTION()
void OnRep_Health();

void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override
{
    DOREPLIFETIME_CONDITION(AMyCharacter, Health, COND_OwnerOnly);
}
```

### Rules
- Server is authoritative - never trust client
- Minimize replicated properties (bandwidth)
- Use `COND_` flags to limit replication scope
- RPCs: Server for validation, Client for cosmetics, Multicast for all

## Performance

### Tick Management
- Disable tick on actors that don't need it: `PrimaryActorTick.bCanEverTick = false`
- Use timers instead of tick for periodic checks
- Use `FTickFunction` groups to control tick order

### Memory
- Use soft references (`TSoftObjectPtr`) for assets not always needed
- Async load with `FStreamableManager`
- Pool frequently spawned actors

### Profiling
- `stat unit` - frame time breakdown
- `stat game` - game thread stats
- `stat gpu` - GPU render stats
- Unreal Insights for deep profiling

## Anti-Patterns

| Don't | Do Instead |
|-------|-----------|
| All logic in Blueprints | C++ base, Blueprint child |
| Tick for everything | Timers, events, delegates |
| Hard references everywhere | Soft references, async loading |
| Trust client input | Server-validate everything |
| God actors with 1000+ lines | Subsystems, components, composition |
| Cast everywhere | Use interfaces |
| Direct property mutation | GameplayEffects for stats |
