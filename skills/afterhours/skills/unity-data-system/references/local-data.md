# Local Data - Persistent Player Data

## Architecture

```
LocalDataService (unified service)
├── IStorageProvider (storage abstraction)
│   └── LocalPrefsStorageProvider (Neonagee LocalPrefs backend, file-based, encrypted)
├── ILocalData implementations (registered as Singletons)
│   └── LocalSettingData (built-in: volume, vibration, sensitivity)
└── Publishes UserDataLoadedSignal when done
```

## ILocalData Interface

```csharp
public interface ILocalData
{
    void Init();           // Set default values (called if no saved data exists)
    void OnDataLoaded();   // Called after data is deserialized from storage
}
```

## Creating New Local Data

```csharp
// 1. Create the data class
public class PlayerProgress : ILocalData
{
    public int Level { get; set; }
    public int Gold { get; set; }
    public List<string> UnlockedItems { get; set; } = new();

    public void Init()
    {
        Level = 1;
        Gold = 0;
    }

    public void OnDataLoaded()
    {
        Debug.Log($"[PlayerProgress] Loaded: Level {Level}, Gold {Gold}");
    }
}

// 2. Auto-registered! RegisterLocalData() discovers all ILocalData types via reflection.

// 3. Inject and use:
public class MyService
{
    private readonly ILocalDataService localDataService;
    public MyService(ILocalDataService localDataService) => this.localDataService = localDataService;

    void Example()
    {
        var progress = localDataService.Get<PlayerProgress>();
    }
}
```

## Save/Load

```csharp
// Auto-loaded on startup by LocalDataService.LoadAllAsync()
// Manual save:
await localDataService.SaveAsync(playerProgress);
await localDataService.SaveAllAsync();

// Get cached data:
var data = localDataService.Get<PlayerProgress>();
```

## Primitive Key-Value API

```csharp
localDataService.SetInt("highScore", 100);
int score = localDataService.GetInt("highScore");
localDataService.SetBool("firstRun", false);
localDataService.SetString("playerName", "Cat");
localDataService.Save();
```

## Built-in: LocalSettingData

```csharp
public class LocalSettingData : ILocalData
{
    public float Sensitivity;
    public ReactiveProperty<float> MusicVolume;
    public ReactiveProperty<float> SoundVolume;
    public bool IsVibrationEnabled;

    // Methods: SetSoundVolume, SetMusicVolume, SetVibration, ToggleVibration
    // Events: OnMusicVolumeChanged, OnSoundVolumeChanged, OnVibrationChanged
}
```

## Storage Provider

Storage backend is abstracted via `IStorageProvider`. Default: `LocalPrefsStorageProvider` (Neonagee LocalPrefs, file-based with Rijndael AES-256 encryption).

```csharp
public interface IStorageProvider
{
    UniTask<string> LoadAsync(string key);
    UniTask SaveAsync(string key, string value);
    UniTask SaveBatchAsync(IEnumerable<(string key, string value)> entries);
    UniTask DeleteAsync(string key);
    UniTask DeleteAllAsync();
}
```

Storage key format: `LD-{TypeName}` (e.g., `LD-PlayerProgress`).
Serialization: Newtonsoft.Json with `TypeNameHandling.Auto` + `LocalDataSerializationBinder` (security).
