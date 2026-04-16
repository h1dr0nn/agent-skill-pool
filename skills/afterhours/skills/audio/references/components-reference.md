# Components & PlaybackGroups Reference

## SoundSource

No-code audio playback component. Attach to any GameObject.

**Menu**: Add Component > AfterhoursAudio > SoundSource

### Serialized Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `_sound` | `SoundID` | — | Which sound to play |
| `_playOnEnable` | `bool` | `true` | Auto-play on enable |
| `_stopOnDisable` | `bool` | `false` | Stop when disabled |
| `_onlyPlayOnce` | `bool` | `false` | Play only on first enable |
| `_positionMode` | `PositionMode` | `Global` | Where sound plays from |
| `_delay` | `float` | `0` | Seconds before playback |
| `_overrideGroup` | `PlaybackGroup` | `null` | Custom validation rules |
| `_overrideFadeOut` | `float` | `-1` | Custom fade-out (-1 = use default) |

### PositionMode

| Mode | Behavior |
|------|----------|
| `Global` | 2D, no spatial positioning |
| `FollowGameObject` | 3D, follows this transform |
| `StayHere` | 3D, plays at current position (doesn't follow) |

### Public API

```csharp
// Properties
IAudioPlayer CurrentPlayer { get; }
bool IsPlaying { get; }
bool IsActive { get; }

// Playback
void Play();                         // Uses configured PositionMode
void PlayGlobally();                 // Force 2D regardless of setting
void Play(Transform followTarget);   // 3D following target
void Play(Vector3 position);         // 3D at position

// Control
void Stop();
void Stop(float fadeTime);
void Pause();
void Pause(float fadeTime);
void UnPause();
void UnPause(float fadeTime);
void SetVolume(float vol);
void SetVolume(float vol, float fadeTime);
void SetPitch(float pitch);
void SetPitch(float pitch, float fadeTime);
```

---

## SoundVolume

Binds audio type volumes to UI sliders. Useful for settings screens.

**Menu**: Add Component > AfterhoursAudio > SoundVolume

### Inner Class: Setting

| Field | Type | Description |
|-------|------|-------------|
| `_audioType` | `AfterhoursAudioType` | Which type to control |
| `_volume` | `float` | Current volume (0-1) |
| `_slider` | `UnityEngine.UI.Slider` | Connected UI slider |

### Public API

```csharp
void Init(GetSliderSetting onGetSliderSetting);  // Initialize settings
void ApplyVolumeToSystem(float fadeTime);         // Push volume to AfterhoursAudio
void SetVolumeToSlider(bool notify);              // Update slider display
void RecordOrigin();                              // Save current values
void ResetToOrigin(float fadeTime);               // Restore saved values
void AddSliderListener();                         // Bind slider events
void RemoveSliderListener();                      // Unbind slider events
```

---

## SpectrumAnalyzer

Real-time FFT spectrum analysis for audio visualization.

**Menu**: Add Component > AfterhoursAudio > SpectrumAnalyzer

### Serialized Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `_soundSource` | `SoundSource` | — | Audio source to analyze |
| `_resolutionScale` | `int` | — | FFT size (6-13, powers of 2: 64-8192) |
| `_channel` | `Channel` | — | Left / Right |
| `_windowType` | `FFTWindow` | — | FFT window function |
| `_metering` | `Metering` | — | Peak / RMS / Average |
| `_attack` | `int` | — | Rise time in ms (per 20dB) |
| `_decay` | `int` | — | Fall time in ms (per 20dB) |
| `_smooth` | `int` | — | Smoothing sample count |
| `_bands` | `Band[]` | — | Frequency bands to analyze |

### Band (Inner Class)

| Property | Type | Description |
|----------|------|-------------|
| `Frequency` | `float` | Center frequency (Hz) |
| `Amplitube` | `float` | Current amplitude (read-only) |
| `DecibelVolume` | `float` | dB reading (read-only) |

### Public API

```csharp
event Action<IReadOnlyList<Band>> OnUpdate;  // Fires each frame with band data
IReadOnlyList<Band> Bands { get; }           // Current band readings
IReadOnlyList<float> Spectrum { get; }       // Raw FFT spectrum data
void SetSource(IAudioPlayer audioPlayer);    // Set custom audio source
```

### Usage Example

```csharp
spectrumAnalyzer.OnUpdate += bands =>
{
    foreach (var band in bands)
    {
        // band.Frequency, band.Amplitube, band.DecibelVolume
        UpdateVisualizer(band.Frequency, band.Amplitube);
    }
};
```

---

## PlaybackGroup (Validation Rules)

Abstract ScriptableObject that controls when sounds can play. Assigned per AudioEntity or globally in RuntimeSetting.

### Built-in Rules

| Rule | Parameter | Description |
|------|-----------|-------------|
| `MaxPlayableCountRule` | `int` max count | Limits simultaneous instances from this group |
| `CombFilteringRule` | — | Prevents comb filtering by spacing same-sound playbacks |

### IPlayableValidator Interface

```csharp
public interface IPlayableValidator
{
    bool IsPlayable(SoundID id, Vector3 position);
    void OnGetPlayer(IAudioPlayer player);
}
```

### PlaybackGroup API

```csharp
// Inherit to create custom groups
public abstract class PlaybackGroup : ScriptableObject, IPlayableValidator
{
    protected abstract IEnumerable<IRule> InitializeRules();

    // Built-in
    bool IsPlayable(SoundID id, Vector3 position);  // Checks all rules
    void OnGetPlayer(IAudioPlayer player);
    IRule GetRule(Type ruleType);
    void SetParent(PlaybackGroup parent);
}
```

### Rule<T> Base

```csharp
public abstract class Rule<T>
{
    T Value;            // Rule parameter
    bool _isOverride;   // Override parent (vs. inherit)

    IRule Initialize(IsPlayableDelegate ruleMethod, Func<Type, IRule> onGetParentRule);
}
```

### Custom PlaybackGroup Example

```csharp
[CreateAssetMenu(menuName = "Audio/MyPlaybackGroup")]
public class MyPlaybackGroup : PlaybackGroup
{
    [SerializeField] private int maxConcurrent = 3;

    protected override IEnumerable<IRule> InitializeRules()
    {
        yield return new MaxPlayableCountRule(maxConcurrent)
            .Initialize(CheckLimit, GetRule);
    }

    private bool CheckLimit(SoundID id, Vector3 position)
    {
        return AfterhoursAudio.HasAnyPlayingInstances(id) == false
            || /* custom count logic */;
    }
}
```

### Using PlaybackGroup with Play

```csharp
// As validator parameter
AfterhoursAudio.Play(soundId, myPlaybackGroup);

// Or assigned on AudioEntity in Inspector (preferred)
```
