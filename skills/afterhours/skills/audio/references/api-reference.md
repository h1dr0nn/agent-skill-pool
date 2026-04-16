# AfterhoursAudio API Reference

## Static Facade (`AfterhoursAudio`)

Namespace: `Ami.AfterhoursAudio`

### Play

```csharp
IAudioPlayer Play(SoundID id, IPlayableValidator validator = null);
IAudioPlayer Play(SoundID id, float fadeIn, IPlayableValidator validator = null);
IAudioPlayer Play(SoundID id, Vector3 position, IPlayableValidator validator = null);
IAudioPlayer Play(SoundID id, Vector3 position, float fadeIn, IPlayableValidator validator = null);
IAudioPlayer Play(SoundID id, Transform followTarget, IPlayableValidator validator = null);
IAudioPlayer Play(SoundID id, Transform followTarget, float fadeIn, IPlayableValidator validator = null);
```

### Stop

```csharp
void Stop(AfterhoursAudioType audioType);
void Stop(AfterhoursAudioType audioType, float fadeOut);
void Stop(SoundID id);
void Stop(SoundID id, float fadeOut);
```

### Pause / UnPause

```csharp
void Pause(SoundID id);
void Pause(SoundID id, float fadeOut);
void Pause(AfterhoursAudioType audioType);
void Pause(AfterhoursAudioType audioType, float fadeOut);
void UnPause(SoundID id);
void UnPause(SoundID id, float fadeIn);
void UnPause(AfterhoursAudioType audioType);
void UnPause(AfterhoursAudioType audioType, float fadeIn);
```

### Volume

```csharp
void SetVolume(float vol, float fadeTime = 0f);                              // Master
void SetVolume(AfterhoursAudioType type, float vol, float fadeTime = 0f);    // Per type
void SetVolume(SoundID id, float vol);                                       // Per sound
void SetVolume(SoundID id, float vol, float fadeTime);                       // Per sound + fade
```

Three-layer system: `ClipVolume x TrackVolume x AudioTypeVolume = Final`

### Pitch

```csharp
void SetPitch(float pitch);
void SetPitch(AfterhoursAudioType type, float pitch);
void SetPitch(AfterhoursAudioType type, float pitch, float fadeTime);
void SetPitch(SoundID id, float pitch);
void SetPitch(SoundID id, float pitch, float fadeTime);
```

### Effects (non-WebGL)

```csharp
IAutoResetWaitable SetEffect(Effect effect);
IAutoResetWaitable SetEffect(Effect effect, AfterhoursAudioType type);
```

Effect factory methods:

```csharp
Effect.LowPass(float frequency, float fadeTime = 0, Ease ease);
Effect.ResetLowPass(float fadeTime = 0, Ease ease);
Effect.HighPass(float frequency, float fadeTime = 0, Ease ease);
Effect.ResetHighPass(float fadeTime = 0, Ease ease);
Effect.Custom(string exposedParam, float value, float fadeTime = 0, Ease ease);
```

### Query

```csharp
bool HasAnyPlayingInstances(SoundID id);
bool TryGetEntityInfo(SoundID id, out IReadOnlyAudioEntity entityInfo);
void ResetMultiClipStrategy(SoundID id);
```

### Events

```csharp
static event Action<IAudioPlayer> OnBGMChanged;
```

### Addressables (requires `PACKAGE_ADDRESSABLES`)

```csharp
bool IsLoaded(SoundID id);
AsyncOperationHandle<AudioClip> LoadAssetAsync(SoundID id);
AsyncOperationHandle<IList<AudioClip>> LoadAllAssetsAsync(SoundID id);
void ReleaseAsset(SoundID id);
void ReleaseAllAssets(SoundID id);
```

---

## IAudioPlayer

Returned by `Play()`. Fluent interface with method chaining.

### Properties

```csharp
SoundID ID { get; }
bool IsActive { get; }               // Playing, paused, or queued
bool IsPlaying { get; }              // Currently audible
IAfterhoursAudioClip CurrentPlayingClip { get; }
IAudioSourceProxy AudioSource { get; }
```

### Lifecycle Callbacks

```csharp
IAudioPlayer OnStart(Action<IAudioPlayer> callback);   // Fade-in begins
IAudioPlayer OnUpdate(Action<IAudioPlayer> callback);   // Each frame
IAudioPlayer OnPause(Action<IAudioPlayer> callback);
IAudioPlayer OnEnd(Action<SoundID> callback);            // Finished + recycled
```

### Control

```csharp
IAudioPlayer SetVolume(float vol, float fadeTime);
IAudioPlayer SetPitch(float pitch, float fadeTime);
IAudioPlayer SetFadeInEase(Ease ease);
IAudioPlayer SetFadeOutEase(Ease ease);
void Stop();
void Stop(float fadeOut);
void Stop(float fadeOut, Action onFinished);
void Pause();
void Pause(float fadeTime);
void UnPause();
void UnPause(float fadeTime);
```

### Scheduling

```csharp
IAudioPlayer SetScheduledStartTime(double dspTime);
IAudioPlayer SetScheduledEndTime(double dspTime);
IAudioPlayer SetDelay(float time);
```

### Audio Analysis

```csharp
void GetOutputData(float[] samples, int channels);
void GetSpectrumData(float[] samples, int channels, FFTWindow window);
```

### Decorators (internal to plugin assembly)

```csharp
IMusicPlayer AsBGM();            // BGM decorator
IPlayerEffect AsDominator();     // Dominator decorator (non-WebGL)
```

**Note**: These are `internal`. Music entities with `AlwaysPlayMusicAsBGM = true` (default RuntimeSetting) are auto-decorated as BGM.

---

## BGM Transitions

| Transition | Old Sound | New Sound |
|------------|-----------|-----------|
| `Default` | Fade out | Then fade in |
| `Immediate` | Stop instantly | Play instantly |
| `OnlyFadeIn` | Stop instantly | Fade in |
| `OnlyFadeOut` | Fade out | Play instantly |
| `CrossFade` | Fade out | Fade in simultaneously |

| StopMode | On Next Play |
|----------|--------------|
| `Stop` | Restart from beginning |
| `Pause` | Resume from paused position |
| `Mute` | Continue silently in background |

---

## Dominator System (non-WebGL)

```csharp
IPlayerEffect AsDominator();

IPlayerEffect QuietOthers(float othersVol, float fadeTime);
IPlayerEffect QuietOthers(float othersVol, Fading fading);
IPlayerEffect LowPassOthers(float freq, float fadeTime);
IPlayerEffect HighPassOthers(float freq, float fadeTime);
```

Effects auto-revert when dominator sound ends.

---

## Audio Types

```csharp
[Flags] enum AfterhoursAudioType
{
    None = 0,
    Music = 1 << 0,
    UI = 1 << 1,
    Ambience = 1 << 2,
    SFX = 1 << 3,
    VoiceOver = 1 << 4,
    All = Music | UI | Ambience | SFX | VoiceOver,
}
```

---

## Easing Functions

```csharp
enum Ease
{
    Linear,
    InQuad, OutQuad, InOutQuad,
    InCubic, OutCubic, InOutCubic,
    InQuart, OutQuart, InOutQuart,
    InQuint, OutQuint, InOutQuint,
    InSine, OutSine, InOutSine,
    InCirc, OutCirc, InOutCirc,
}
```

---

## Recommended Constants (`AfterhoursAdvice`)

```csharp
AfterhoursAdvice.FadeTime_Immediate = 0f;
AfterhoursAdvice.FadeTime_Quick = 0.5f;
AfterhoursAdvice.FadeTime_Smooth = 1f;
AfterhoursAdvice.LowPassFrequency = 300f;
AfterhoursAdvice.HighPassFrequency = 2000f;
```
