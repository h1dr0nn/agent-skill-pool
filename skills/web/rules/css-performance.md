# CSS & Performance

## Design Tokens

Define tokens as CSS custom properties:

```css
:root {
  --color-surface: oklch(98% 0 0);
  --color-text: oklch(18% 0 0);
  --color-accent: oklch(68% 0.21 250);
  --text-base: clamp(1rem, 0.92rem + 0.4vw, 1.125rem);
  --space-section: clamp(4rem, 3rem + 5vw, 10rem);
}
```

## Animation

- Animate only compositor-friendly properties: `transform`, `opacity`, `clip-path`
- Never animate `width`, `height`, `top`, `left`, `margin`, `padding`
- Use `will-change` narrowly and remove when done
- Prefer CSS transitions for simple motion, JS libraries for complex sequences
- Respect `prefers-reduced-motion`

## Core Web Vitals Targets

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |

## Image Optimization

- Explicit `width` and `height` on all images
- `loading="lazy"` for below-the-fold
- `fetchpriority="high"` for hero image only
- Prefer AVIF/WebP with fallbacks

## Bundle Budget

| Page Type | JS (gzipped) |
|-----------|-------------|
| Landing | < 150kb |
| App page | < 300kb |

## Font Loading

- Max 2 font families
- `font-display: swap`
- Preload only the critical weight
- Subset when possible
