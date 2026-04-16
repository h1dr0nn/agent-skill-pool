---
name: unity-data-system
description: Data architecture - BlueprintService (SO/CSV/JSON), LocalData persistence with encryption, IO Database system, object pooling. Load when working with game data, blueprints, save/load, or pooling.
---

# Data Systems

This skill covers all data-related systems in Afterhours Foundation.

- [Blueprint API](references/blueprint-api.md) — BlueprintService, IBlueprintData, SO/CSV/JSON loading
- [Local Data](references/local-data.md) — ILocalData, EncryptedPlayerPrefs, LocalSettingData
- [IO Database](references/io-database.md) — IdentifiedObject, Category, IODatabase, SerializeReference

## Decision Tree

```
What kind of data?
├── Static game config (items, levels, enemies)?  → BlueprintService (SO/CSV/JSON via Addressables)
├── Player progress, settings, save data?          → LocalData (ILocalData + EncryptedPlayerPrefs)
├── Editor-driven content database?                → IO Database (IdentifiedObject + IODatabase)
└── Runtime spawned objects?                        → uPools (SharedGameObjectPool / IGlobalPoolService)
```

## Object Pooling Quick Reference

```csharp
// Rent/Return
var bullet = SharedGameObjectPool.Rent(bulletPrefab);
SharedGameObjectPool.Return(bullet);

// Prewarm at startup
SharedGameObjectPool.Prewarm(bulletPrefab, 50);

// Reset callback
public class Bullet : MonoBehaviour, IPoolCallbackReceiver
{
    public void OnRent() { velocity = Vector3.zero; }
    public void OnReturn() { StopAllCoroutines(); }
}

// Global pool service (via DI)
var obj = globalPoolService.Rent(prefab);
globalPoolService.Return(obj);
globalPoolService.Prewarm(prefab, 20);
```
