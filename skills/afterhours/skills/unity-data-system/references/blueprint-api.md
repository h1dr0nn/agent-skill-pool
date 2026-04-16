# BlueprintService - Static Game Data

## Concept

BlueprintService provides **O(1) cached access** to static game data loaded from Addressables.

## IBlueprintData Interface

```csharp
public interface IBlueprintData
{
    string Index { get; } // Unique identifier
}
```

## BlueprintBase (ScriptableObject)

```csharp
public abstract class BlueprintBase : ScriptableObject, IBlueprintData
{
    public string Index => name; // Auto-set to asset name
}
```

## API

```csharp
// Initialize (idempotent, called automatically on startup)
await blueprintService.InitializeAsync();

// Get single item by ID
var weapon = blueprintService.GetData<WeaponData>("sword_01");

// Get all items of type
var allWeapons = blueprintService.GetAllData<WeaponData>();

// Get ScriptableObject blueprint
var config = blueprintService.GetBlueprint<GameConfig>("GameConfig");

// Load CSV table (auto-cached)
var enemies = await blueprintService.LoadCsvTableAsync<EnemyData>("EnemyTable");

// Load JSON data (auto-cached)
var levelData = await blueprintService.LoadJsonDataAsync<LevelData>("Level01");
```

## Auto-Loading ScriptableObjects

1. Create SO inheriting from `BlueprintBase`
2. In Addressables, add the asset and assign label `"Blueprint"`
3. `BlueprintService` auto-loads all assets with this label on startup

If no assets have the "Blueprint" label, the service logs a warning and continues.

## Creating a New Blueprint

```csharp
// 1. Define data
[CreateAssetMenu(fileName = "NewWeapon", menuName = "Blueprints/WeaponData")]
public class WeaponData : BlueprintBase
{
    public int Damage;
    public float AttackSpeed;
    public Sprite Icon;
}

// 2. Create SO asset in Unity
// 3. Mark as Addressable with label "Blueprint"
// 4. Access:
var sword = blueprintService.GetBlueprint<WeaponData>("Sword");
```

## CSV Data

```csharp
// Data class (not SO — plain class with IBlueprintData)
public class EnemyRow : IBlueprintData
{
    public string Index { get; set; }
    public string Name { get; set; }
    public int HP { get; set; }
    public float Speed { get; set; }
}

// Load from Addressable text asset
var enemies = await blueprintService.LoadCsvTableAsync<EnemyRow>("EnemyTable");
var goblin = blueprintService.GetData<EnemyRow>("goblin_01");
```

CSV parsing uses `CsvCSharp` library. JSON uses `System.Text.Json`.

## Cache Architecture

```
Dictionary<Type, Dictionary<string, IBlueprintData>>
```

Data is cached under **all types in its hierarchy** (concrete class, base classes, interfaces), enabling polymorphic queries.
