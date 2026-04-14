---
name: unity-editor-window
description: Build polished Unity Editor windows with custom IMGUI styling — themed buttons, animated tab bars, card layouts, progress indicators, and consistent color systems. Use when creating or improving EditorWindow UI beyond default Unity controls.
---

# Unity Editor Window Design

Build production-quality Unity Editor windows that look intentional, not default. This skill covers custom IMGUI rendering patterns for `EditorWindow` and `EditorGUI` contexts.

## When to Use

- Creating a new `EditorWindow` with custom UI
- Upgrading bland default Unity editor UI into something polished
- Adding themed buttons, tab bars, cards, or progress indicators
- Building multi-tab editor tools with consistent visual language
- Any editor tooling where UX quality matters

## Scope Boundaries

**Does:**
- Custom button rendering with color themes and hover states
- Animated tab bars with slide transitions
- Card-based layouts with headers, separators, badges
- Inline and standalone progress bars (determinate + indeterminate)
- Color system management (theme constants, dark/light mode support)
- Proper alignment of custom controls alongside EditorGUI fields

**Does not:**
- Runtime UI (use UGUI or UI Toolkit instead)
- UI Toolkit / USS styling (this is IMGUI only)
- Complex node editors or graph views

## Color System

Always define a centralized theme block at the top of the EditorWindow class. Never hardcode colors inline.

```csharp
// ─── Theme ───────────────────────────────────────
private static bool Pro => EditorGUIUtility.isProSkin;
private static Color C(float v) => new(v, v, v);

// Accent
private static readonly Color Accent      = new(0.24f, 0.44f, 0.74f);
private static readonly Color AccentHover  = new(0.28f, 0.50f, 0.80f);

// Button palette
private static readonly Color BtnGray      = new(0.35f, 0.35f, 0.35f);
private static readonly Color BtnGrayHover = new(0.45f, 0.45f, 0.45f);
private static readonly Color BtnRed       = new(0.45f, 0.18f, 0.18f);
private static readonly Color BtnRedHover  = new(0.55f, 0.25f, 0.25f);
private static readonly Color BtnGreen     = new(0.18f, 0.40f, 0.18f);
private static readonly Color BtnGreenHover= new(0.25f, 0.50f, 0.25f);
private static readonly Color BtnOrange    = new(0.65f, 0.42f, 0.15f);
private static readonly Color BtnOrangeHover=new(0.75f, 0.50f, 0.22f);

// Surfaces
private static Color HeaderBg  => Pro ? C(0.13f) : C(0.80f);
private static Color TabBarBg  => Pro ? C(0.16f) : C(0.84f);
private static Color CardBg    => Pro ? C(0.24f) : C(0.97f);
private static Color SepColor  => Pro ? C(0.28f) : C(0.76f);
private static Color MutedText => Pro ? C(0.50f) : C(0.42f);
private static Color ErrorText => new(0.92f, 0.32f, 0.32f);
private static Color SuccessText => new(0.28f, 0.78f, 0.45f);
```

### Rules

- Use `Pro` check for all surface colors — dark and light mode must both look intentional
- Button colors: darker than you think. Editor background is dark, overly bright buttons look cheap
- Hover colors: ~10-15% brighter than base, no more
- Semantic colors (red=destructive, green=confirm, orange=caution, gray=neutral)

## Custom Button — `DrawColorButton`

The core reusable button primitive. Use for **standalone buttons** (full-width or fixed-width actions). Do NOT use for inline buttons next to EditorGUI fields.

```csharp
private static void DrawColorButton(string text, Color color, Color hoverColor,
    Action onClick, params GUILayoutOption[] options)
{
    var btnRect = options.Length > 0
        ? GUILayoutUtility.GetRect(0, 36, options)
        : GUILayoutUtility.GetRect(0, 36, GUILayout.ExpandWidth(true));
    var hover = btnRect.Contains(Event.current.mousePosition);

    if (Event.current.type == EventType.Repaint)
        EditorGUI.DrawRect(btnRect, hover ? hoverColor : color);

    var label = new GUIStyle(EditorStyles.boldLabel)
    {
        fontSize = 12,
        alignment = TextAnchor.MiddleCenter,
        normal = { textColor = Color.white },
    };
    GUI.Label(btnRect, text, label);

    if (Event.current.type == EventType.MouseDown
        && btnRect.Contains(Event.current.mousePosition))
    {
        Event.current.Use();
        onClick?.Invoke();
    }
    EditorGUIUtility.AddCursorRect(btnRect, MouseCursor.Link);
}

// Convenience wrappers
private static void DrawAccentButton(string text, Action onClick)
    => DrawColorButton(text, Accent, AccentHover, onClick);
```

### When to use `DrawColorButton` vs `GUILayout.Button`

| Context | Use |
|---------|-----|
| Standalone action (Sync, Build, Create) | `DrawColorButton` |
| Inline next to TextField / Popup / Slider | `GUILayout.Button` with `EditorStyles.miniButton` |
| Small utility (All, None, Refresh in header) | `GUILayout.Button` with `EditorStyles.miniButton` |

**Why**: `DrawColorButton` uses `GUILayoutUtility.GetRect` which doesn't vertically align with `EditorGUILayout` controls. Inline buttons must use `GUILayout.Button` to stay in the same layout flow.

### Inline button style

```csharp
var style = new GUIStyle(EditorStyles.miniButton)
{
    fixedHeight = 18, fontSize = 10,
    padding = new RectOffset(6, 6, 2, 2),
    normal = { textColor = Pro ? C(0.85f) : C(0.18f) },
};
if (GUILayout.Button("Refresh", style, GUILayout.Width(56)))
    DoSomething();
```

## Animated Tab Bar

Tabs with slide animation on switch. Works in both `EditorWindow` and static drawer classes.

```csharp
private static float s_HighlightX = -1;
private static double s_AnimStart;
private static int s_AnimFrom;
private const float AnimDuration = 0.25f;

private static void DrawTabBar(string[] tabs, ref int activeTab, Rect barRect)
{
    var pad = 4f;
    var gap = 2f;
    var totalGap = gap * (tabs.Length - 1) + pad * 2;
    var tabW = (barRect.width - totalGap) / tabs.Length;

    // Target X for active tab
    var targetX = barRect.x + pad + activeTab * (tabW + gap);

    // Initialize or animate
    if (s_HighlightX < 0) s_HighlightX = targetX;
    if (Mathf.Abs(s_HighlightX - targetX) > 0.5f)
    {
        var t = (float)((EditorApplication.timeSinceStartup - s_AnimStart) / AnimDuration);
        t = Mathf.Clamp01(t);
        t = 1f - (1f - t) * (1f - t); // ease-out quad
        var fromX = barRect.x + pad + s_AnimFrom * (tabW + gap);
        s_HighlightX = Mathf.Lerp(fromX, targetX, t);
        if (t < 1f) RepaintActiveWindow();
    }
    else
    {
        s_HighlightX = targetX;
    }

    // Draw highlight
    if (Event.current.type == EventType.Repaint)
    {
        EditorGUI.DrawRect(barRect, TabBarBg);
        var hlRect = new Rect(s_HighlightX, barRect.y + 3, tabW, barRect.height - 6);
        EditorGUI.DrawRect(hlRect, Accent);
    }

    // Tab labels + clicks
    for (int i = 0; i < tabs.Length; i++)
    {
        var tabRect = new Rect(barRect.x + pad + i * (tabW + gap),
            barRect.y + 3, tabW, barRect.height - 6);
        bool active = activeTab == i;
        bool hover = !active && tabRect.Contains(Event.current.mousePosition);

        if (Event.current.type == EventType.Repaint && hover)
            EditorGUI.DrawRect(tabRect, Pro ? C(0.24f) : C(0.88f));

        var style = new GUIStyle(EditorStyles.label)
        {
            fontSize = 11,
            fontStyle = active ? FontStyle.Bold : FontStyle.Normal,
            alignment = TextAnchor.MiddleCenter,
            normal = { textColor = active ? Color.white : MutedText },
        };

        if (GUI.Button(tabRect, tabs[i], style))
        {
            s_AnimFrom = activeTab;
            s_AnimStart = EditorApplication.timeSinceStartup;
            activeTab = i;
        }
        EditorGUIUtility.AddCursorRect(tabRect, MouseCursor.Link);
    }
}
```

### Animation tips

- **Duration**: 0.2-0.3s. Shorter feels snappy, longer feels sluggish
- **Easing**: ease-out quad `t = 1 - (1-t)*(1-t)` — decelerates naturally
- **Repaint**: call `Repaint()` on the window during animation, stop when done
- **Static state**: use `static` fields for animation state — survives `OnGUI` redraws

## Card Layout

Group related controls in bordered cards with title + separator.

```csharp
private static void BeginCard(string title)
{
    GUILayout.Space(6);
    GUILayout.BeginHorizontal();
    GUILayout.Space(14);
    GUILayout.BeginVertical();

    // Title
    GUILayout.BeginHorizontal();
    var titleStyle = new GUIStyle(EditorStyles.boldLabel)
    {
        fontSize = 12,
        normal = { textColor = Pro ? C(0.85f) : C(0.18f) },
    };
    GUILayout.Label(title, titleStyle);
    GUILayout.EndHorizontal();

    // Separator
    var lineRect = GUILayoutUtility.GetRect(0, 1, GUILayout.ExpandWidth(true));
    if (Event.current.type == EventType.Repaint)
        EditorGUI.DrawRect(lineRect, SepColor);

    GUILayout.Space(6);
}

private static void EndCard()
{
    GUILayout.Space(6);
    GUILayout.EndVertical();
    GUILayout.Space(14);
    GUILayout.EndHorizontal();
}
```

### Optional: inline mini progress bar in card title

For showing loading state without disrupting layout, overlay a small animated bar on the right side of the title row using `GetLastRect()`:

```csharp
// After GUILayout.EndHorizontal() for the title row:
if (showProgress)
{
    var lastRect = GUILayoutUtility.GetLastRect();
    var barH = 10f;
    var barW = lastRect.width * 0.5f;
    var miniBar = new Rect(lastRect.xMax - barW,
        lastRect.yMax - barH - 1, barW, barH);
    if (Event.current.type == EventType.Repaint)
    {
        EditorGUI.DrawRect(miniBar, Pro ? C(0.18f) : C(0.82f));
        // Animated sliding indicator
        var t = (float)((EditorApplication.timeSinceStartup * 0.8) % 1.0);
        var slideW = miniBar.width * 0.3f;
        var slideX = miniBar.x + (miniBar.width + slideW) * t - slideW;
        var x0 = Mathf.Max(slideX, miniBar.x);
        var x1 = Mathf.Min(slideX + slideW, miniBar.xMax);
        if (x1 > x0)
            EditorGUI.DrawRect(new Rect(x0, miniBar.y, x1 - x0, miniBar.height), Accent);
    }
    Repaint();
}
```

**Key**: use `GetLastRect()` overlay — does NOT participate in layout, so it never pushes other elements around.

## Badge

Small colored label for counts, status, or tags.

```csharp
private static void DrawBadge(string text, Color color)
{
    var content = new GUIContent(text);
    var style = new GUIStyle(EditorStyles.miniLabel)
    {
        fontSize = 9, alignment = TextAnchor.MiddleCenter,
        normal = { textColor = Color.white },
        padding = new RectOffset(6, 6, 1, 1),
    };
    var size = style.CalcSize(content);
    var rect = GUILayoutUtility.GetRect(size.x + 4, size.y + 2);
    if (Event.current.type == EventType.Repaint)
        EditorGUI.DrawRect(rect, new Color(color.r, color.g, color.b, 0.7f));
    GUI.Label(rect, text, style);
}
```

## Key-Value Display

For status/info rows inside cards.

```csharp
private static void DrawKeyValue(string key, string value, Color? valueColor = null)
{
    EditorGUILayout.BeginHorizontal();
    var keyStyle = new GUIStyle(EditorStyles.label)
    {
        normal = { textColor = MutedText },
    };
    EditorGUILayout.LabelField(key, keyStyle, GUILayout.Width(100));
    var valStyle = new GUIStyle(EditorStyles.label)
    {
        normal = { textColor = valueColor ?? (Pro ? C(0.82f) : C(0.16f)) },
    };
    EditorGUILayout.LabelField(value, valStyle);
    EditorGUILayout.EndHorizontal();
}
```

## Performance Tips

- **Cache expensive loads**: if loading JSON/assets for display, cache in memory with `LastWriteTime` check — don't re-parse every `OnGUI` frame
- **GUIStyle allocation**: create styles in `static readonly` fields or cache them — don't `new GUIStyle()` every frame in hot paths
- **Repaint sparingly**: only call `Repaint()` when animating or waiting for async results. Don't repaint unconditionally
- **GetLastRect overlay**: for decorative elements (progress bars, badges on titles), overlay with `GetLastRect()` instead of adding to layout flow

## Common Pitfalls

| Pitfall | Fix |
|---------|-----|
| `DrawColorButton` misaligned with EditorGUI fields | Use `GUILayout.Button` + miniButton style for inline controls |
| `GUILayoutUtility.GetRect(0, 36, options)` ignores Height option | Height in options overrides the parameter, but minHeight=36 may win — pass 0 as default |
| Colors too bright on dark editor theme | Start dark (0.2-0.4 range), hover +0.1 |
| Animation stutters | Ensure `Repaint()` called every frame during animation; use `EditorApplication.timeSinceStartup` not `Time.time` |
| Layout shifts when elements appear/disappear | Use `GetLastRect()` overlay for conditional decorations |
| `GUILayout.Button` in `EditorGUI.DisabledGroupScope` not grayed out | `DrawColorButton` needs manual disabled color: check condition and swap to gray |
