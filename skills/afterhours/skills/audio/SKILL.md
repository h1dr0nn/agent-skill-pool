---
name: afterhours-audio
description: AfterhoursAudio plugin - SoundID, IAudioPlayer, PlaybackGroups, multi-clip strategies, BGM transitions, spatial audio, SoundSource/SoundVolume/SpectrumAnalyzer components. Load when working with audio playback, sound effects, music, or audio-related components.
---

# AfterhoursAudio

Audio management plugin with pooling, spatial audio, BGM transitions, and playback rules.

- [API Reference](references/api-reference.md) — Static facade, IAudioPlayer, volume/pitch/effects
- [Components Reference](references/components-reference.md) — SoundSource, SoundVolume, SpectrumAnalyzer, PlaybackGroups
- [Data & Strategies](references/data-strategies.md) — AudioEntity, SoundID, multi-clip modes, spatial settings

## Decision Tree

```
What are you implementing?
├── Playing a sound from code?              → api-reference.md (Play API)
├── Playing from a GameObject (no-code)?    → components-reference.md (SoundSource)
├── Volume slider / settings UI?            → components-reference.md (SoundVolume)
├── Audio visualization?                    → components-reference.md (SpectrumAnalyzer)
├── BGM with transitions?                   → api-reference.md (BGM Transitions)
├── Limiting concurrent sounds?             → components-reference.md (PlaybackGroups)
├── Multi-clip variation (random/shuffle)?  → data-strategies.md (Multi-Clip Modes)
├── 3D spatial audio setup?                 → data-strategies.md (SpatialSetting)
├── Audio effects (lowpass/highpass)?       → api-reference.md (Effects)
└── IAudioService (DI integration)?         → afterhours-unity-core skill (services-reference.md)
```

## Two-Tier Architecture

```
Gameplay code (Presenters, States)
    └── IAudioService (DI) → key-based, via BlueprintService

Scene components (SoundSource, SoundVolume)
    └── AfterhoursAudio.* (direct, no DI)
```

- **Never** call `AfterhoursAudio.*` directly from Presenters/States — use `IAudioService`
- Scene components (`SoundSource`, `SoundVolume`, `SpectrumAnalyzer`) use AfterhoursAudio directly — this is correct

## Namespace

All AfterhoursAudio types are in `Ami.AfterhoursAudio`:

```csharp
using Ami.AfterhoursAudio;
```

This gives access to: `AfterhoursAudio` (static facade), `SoundID`, `AfterhoursAudioType`, `Effect`, `Fading`, `Ease`, `Transition`, `StopMode`, `PlaybackGroup`, etc.

## Key Gotcha

`AsBGM()` and `AsDominator()` are `internal` to the plugin assembly. They cannot be called from project code. Music behavior is determined by the `AfterhoursAudioType` set on the `AudioEntity` ScriptableObject — entities typed as `Music` with `AlwaysPlayMusicAsBGM = true` (default) are automatically treated as BGM.
