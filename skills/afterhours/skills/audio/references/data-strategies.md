# Data Structures & Strategies Reference

## SoundID

Lightweight serializable struct wrapping an `AudioEntity` reference.

```csharp
namespace Ami.AfterhoursAudio;

[Serializable]
public struct SoundID : IEquatable<SoundID>, IComparable<SoundID>
{
    [SerializeField] private AudioEntity _entity;

    public SoundID(AudioEntity entity);
    public static SoundID Invalid { get; }
}
```

### Extension Methods

```csharp
public static bool IsValid(this SoundID id);
public static AfterhoursAudioType ToAudioType(this SoundID id);
public static AudioClip GetAudioClip(this SoundID id);
public static bool HasAnyPlayingInstances(this SoundID id);

// Convenience play (same as AfterhoursAudio.Play)
public static IAudioPlayer Play(this SoundID id);
public static IAudioPlayer Play(this SoundID id, float fadeIn);
public static IAudioPlayer Play(this SoundID id, Vector3 position);
public static IAudioPlayer Play(this SoundID id, Transform followTarget);
```

### Usage

```csharp
// In MonoBehaviour
[SerializeField] private SoundID jumpSound;

void OnJump()
{
    if (jumpSound.IsValid())
        jumpSound.Play();  // Extension method
}
```

---

## AudioEntity (ScriptableObject)

Core sound definition. Created via LibraryManager (Tools > AfterhoursAudio > LibraryManager).

### Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `Clips` | `AfterhoursAudioClip[]` | Audio clips array |
| `AudioType` | `AfterhoursAudioType` | Music / SFX / UI / Ambience / VoiceOver |
| `MasterVolume` | `float` | Base volume (0-1) |
| `Pitch` | `float` | Base pitch (1.0 = default) |
| `Loop` | `bool` | Enable looping |
| `SeamlessLoop` | `bool` | Crossfade loop transition |
| `TransitionTime` | `float` | Seamless loop fade duration |
| `Priority` | `int` | AudioSource priority (0=highest, 256=lowest) |
| `SpatialSetting` | `SpatialSetting` | 3D audio config SO |
| `MulticlipsPlayMode` | `MulticlipsPlayMode` | Clip selection strategy |
| `RandomFlags` | `RandomFlag` | Which properties randomize (Pitch, Volume) |
| `PitchRandomRange` | `float` | Pitch variation range |
| `VolumeRandomRange` | `float` | Volume variation range |
| `PlaybackGroup` | `PlaybackGroup` | Per-entity validation rules |

---

## AfterhoursAudioClip (Per-Clip Settings)

Serializable wrapper for each clip in an AudioEntity.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `AudioClip` | `AudioClip` | — | Unity AudioClip |
| `Volume` | `float` | 1 | Clip-level volume (0-1) |
| `Delay` | `float` | 0 | Delay before this clip plays |
| `StartPosition` | `float` | 0 | Start at (seconds) |
| `EndPosition` | `float` | 0 | End at (seconds, 0 = full) |
| `FadeIn` | `float` | 0 | Per-clip fade-in duration |
| `FadeOut` | `float` | 0 | Per-clip fade-out duration |
| `Weight` | `int` | 0 | Probability weight (Random/Shuffle modes) |
| `Velocity` | `int` | 0 | Threshold (Velocity mode) |

---

## Multi-Clip Playback Modes

Set on `AudioEntity.MulticlipsPlayMode`.

| Mode | Strategy Class | Behavior |
|------|---------------|----------|
| `Single` | `SingleClipStrategy` | Always plays clip[0] |
| `Sequence` | `SequenceClipStrategy` | In order, wraps around. Maintains `_sequenceIndex` |
| `Random` | `RandomClipStrategy` | Weighted random using clip `Weight` (0 = uniform) |
| `Shuffle` | `ShuffleClipStrategy` | Random without repeat. Resets when all played |
| `Velocity` | `VelocityClipStrategy` | Selects by velocity threshold from clip `Velocity` field |
| `Chained` | `ChainedClipStrategy` | 4-stage: clip[0]=Intro, [1]=Start, [2]=Loop, [3]=End |

### Reset Strategy State

```csharp
AfterhoursAudio.ResetMultiClipStrategy(soundId);
```

### Clip Selection Interface

```csharp
public interface IClipSelectionStrategy
{
    IAfterhoursAudioClip SelectClip(AfterhoursAudioClip[] clips, ClipSelectionContext context, out int index);
    void Reset();
}
```

---

## SpatialSetting (ScriptableObject)

3D audio configuration, assigned per AudioEntity.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `StereoPan` | `float` | 0 | Panning (-1 left, 1 right) |
| `DopplerLevel` | `float` | 1 | Doppler effect intensity |
| `MinDistance` | `float` | 1 | Attenuation start distance |
| `MaxDistance` | `float` | 500 | Attenuation end distance |
| `RolloffMode` | `AudioRolloffMode` | Logarithmic | Attenuation curve type |
| `CustomRolloff` | `AnimationCurve` | — | Custom attenuation curve |
| `SpatialBlend` | `AnimationCurve` | — | 2D/3D blend (0=2D, 1=3D) |
| `Spread` | `AnimationCurve` | — | Speaker spread angle |
| `ReverbZoneMix` | `AnimationCurve` | — | Reverb zone mixing |
| `HasLowPassFilter` | `bool` | false | Distance-based low-pass |
| `LowpassLevelCustomCurve` | `AnimationCurve` | — | Lowpass by distance |

---

## Effect (Struct)

Immutable audio effect descriptor with factory methods.

```csharp
// Factory methods
Effect.LowPass(float frequency, float fadeTime = 0, Ease ease);
Effect.ResetLowPass(float fadeTime = 0, Ease ease);
Effect.HighPass(float frequency, float fadeTime = 0, Ease ease);
Effect.ResetHighPass(float fadeTime = 0, Ease ease);
Effect.Custom(string exposedParamName, float value, float fadeTime = 0, Ease ease);

// Properties
EffectType Type { get; }
float Value { get; }
Fading Fading { get; }
string CustomExposedParameter { get; }
bool IsDominator { get; }
bool IsDefault();
```

---

## Fading (Struct)

Fade configuration with easing.

```csharp
Fading(float fadeIn, float fadeOut, EffectType effectType);  // Auto eases
Fading(float fadeTime, EffectType effectType);                // Same duration
Fading(float fadeIn, float fadeOut, Ease inEase, Ease outEase); // Custom eases

float FadeIn { get; }
float FadeOut { get; }
Ease FadeInEase { get; }
Ease FadeOutEase { get; }
```

---

## RuntimeSetting

Global config ScriptableObject. Located in plugin Resources.

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `DefaultFadeInEase` | `Ease` | `InCubic` | Default fade-in curve |
| `DefaultFadeOutEase` | `Ease` | `OutSine` | Default fade-out curve |
| `DefaultAudioPlayerPoolSize` | `int` | `5` | Initial pool size |
| `AlwaysPlayMusicAsBGM` | `bool` | `true` | Auto-decorate Music type as BGM |
| `DefaultBGMTransition` | `Transition` | `CrossFade` | BGM switch behavior |
| `DefaultBGMTransitionTime` | `float` | `2.0` | BGM transition fade duration |
| `AudioFilterSlope` | `FilterSlope` | `FourPole` | 12dB or 24dB per octave |
| `PitchSetting` | `PitchShiftingSetting` | `AudioSource` | Pitch via mixer or source |
| `AutomaticallyLoadAddressableAudioClips` | `bool` | `false` | Preload on Play |
| `AutomaticallyUnloadUnusedAddressableAudioClipsAfter` | `float` | `60` | Cleanup timeout (seconds) |
| `GlobalPlaybackGroup` | `PlaybackGroup` | `null` | Rules applied to all sounds |

---

## Key Enums

```csharp
[Flags] enum AfterhoursAudioType { None, Music, UI, Ambience, SFX, VoiceOver, All }
[Flags] enum EffectType { None, Volume, LowPass, HighPass, Custom, All }
[Flags] enum RandomFlag { None, Pitch, Volume }

enum MulticlipsPlayMode { Single, Sequence, Random, Shuffle, Velocity, Chained }
enum LoopType { None, Loop, SeamlessLoop }
enum PlaybackStage { None, Start, Loop, End }
enum Transition { Default, Immediate, OnlyFadeIn, OnlyFadeOut, CrossFade }
enum StopMode { Stop, Pause, Mute }
enum AudioTrackType { Generic, Dominator }
enum FilterSlope { TwoPole, FourPole }
enum PitchShiftingSetting { AudioMixer, AudioSource }
```

---

## Audio Constants

```csharp
AudioConstant.MinVolume = 0.0001f;
AudioConstant.FullVolume = 1f;
AudioConstant.MaxVolume = 10f;
AudioConstant.MinDecibelVolume = -80f;
AudioConstant.MinFrequency = 10f;
AudioConstant.MaxFrequency = 22000f;
AudioConstant.DefaultPitch = 1f;
AudioConstant.SpatialBlend_2D = 0f;
AudioConstant.SpatialBlend_3D = 1f;
AudioConstant.AttenuationMinDistance = 1f;
AudioConstant.AttenuationMaxDistance = 500f;
```

---

## AudioExtension Utilities

```csharp
// Volume conversion
float vol.ToDecibel(bool allowBoost = true);
float dB.ToNormalizeVolume(bool allowBoost = true);
float vol.ClampNormalize(bool allowBoost = false);

// Clip data
bool clip.TryGetSampleData(out float[] samples, float startPos, float endPos);
double clip.GetPreciseLength();
double source.GetPreciseTime();

// Frequency
bool AudioExtension.IsValidFrequency(float freq);
float AudioExtension.TempoToTime(float bpm, int beats);
```
