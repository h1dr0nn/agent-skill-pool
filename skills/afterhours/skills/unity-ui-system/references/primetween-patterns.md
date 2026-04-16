# PrimeTween Patterns

## Setup

```csharp
using PrimeTween;
```

Package installed via local tgz: `com.kyrylokuzyk.primetween` in Packages/manifest.json.

## Single Tweens

```csharp
// Transform
await Tween.Position(transform, targetPos, duration, Ease.OutQuad);
await Tween.LocalPosition(transform, targetPos, duration);
await Tween.Rotation(transform, targetRot, duration, Ease.OutBack);
await Tween.Scale(transform, Vector3.one, duration);

// UI
await Tween.Alpha(canvasGroup, 0f, duration, Ease.InQuad);
await Tween.UIFillAmount(image, 1f, duration);
await Tween.UISizeDelta(rectTransform, newSize, duration, Ease.InOutQuad);
await Tween.UIAnchoredPosition(rectTransform, targetPos, duration);

// Color
await Tween.Color(spriteRenderer, Color.red, duration);

// OnUpdate callback
await Tween.UIFillAmount(image, targetFill, 0.3f)
    .OnUpdate(image, (img, _) => UpdateIndicator());
```

## Sequences (Parallel & Sequential)

```csharp
// Parallel (Group)
await Sequence.Create()
    .Group(Tween.Alpha(canvasGroup, 1f, 0.3f, Ease.OutQuad))
    .Group(Tween.Scale(transform, Vector3.one, 0.3f, Ease.OutBack));

// Sequential (Chain)
await Sequence.Create()
    .Chain(Tween.Position(transform, posA, 0.5f))
    .Chain(Tween.Position(transform, posB, 0.5f));

// Mixed
await Sequence.Create()
    .Group(Tween.Alpha(cg, 0f, 0.3f))
    .Group(Tween.Position(t1, exit, 0.3f))
    .Chain(Tween.Alpha(cg2, 1f, 0.3f));
```

## Looping

```csharp
// Infinite rotation (loading spinner)
Tween.Rotation(transform, Quaternion.Euler(0, 0, -360f), duration,
    ease: Ease.Linear, cycles: -1, cycleMode: CycleMode.Restart);
```

## Common Ease Values

| Ease | Use Case |
|------|----------|
| `Ease.Linear` | Constant speed, spinners |
| `Ease.OutQuad` | Smooth deceleration (general) |
| `Ease.OutBack` | Overshoot (popups, scale) |
| `Ease.InQuad` | Smooth acceleration (hide) |
| `Ease.InOutQuad` | Smooth both ends (size changes) |
| `Ease.OutCubic` | Smooth scroll |

## Tween as Field (Stop/Control)

```csharp
private Tween activeTween;

void StartAnim()
{
    activeTween = Tween.Position(transform, target, 1f);
}

void StopAnim()
{
    activeTween.Stop();
}
```
