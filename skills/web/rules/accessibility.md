# Accessibility (a11y)

## Semantic HTML First

```html
<header>
  <nav aria-label="Main navigation">...</nav>
</header>
<main>
  <section aria-labelledby="hero-heading">
    <h1 id="hero-heading">...</h1>
  </section>
</main>
<footer>...</footer>
```

- Use semantic elements over generic `div` stacks
- Heading hierarchy: one `h1`, logical `h2`-`h6` order
- Use `button` for actions, `a` for navigation

## Keyboard Navigation

- All interactive elements must be keyboard accessible
- Visible focus indicators (never `outline: none` without replacement)
- Logical tab order follows visual order
- Trap focus in modals, release on close

## ARIA Guidelines

- Prefer native HTML semantics over ARIA roles
- Use `aria-label` or `aria-labelledby` for icon-only buttons
- Use `aria-live` regions for dynamic content updates
- Never use `role="presentation"` on interactive elements

## Forms

- Every input needs a visible `<label>` (or `aria-label`)
- Group related fields with `<fieldset>` and `<legend>`
- Show error messages inline, linked via `aria-describedby`
- Do not rely on color alone to indicate errors

## Color & Contrast

- Minimum contrast ratio: 4.5:1 for text, 3:1 for large text
- Do not convey information through color alone
- Test with color blindness simulators

## Testing Checklist

- [ ] Run automated a11y checker (axe, Lighthouse)
- [ ] Tab through entire page with keyboard only
- [ ] Test with screen reader (VoiceOver, NVDA)
- [ ] Verify reduced-motion behavior
- [ ] Check at 200% zoom
