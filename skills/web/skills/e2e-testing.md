---
name: e2e-testing
description: End-to-end testing with Playwright - page objects, selectors, assertions, CI integration, flaky test strategies. Use when writing or maintaining E2E tests.
---

# E2E Testing with Playwright

## When to Activate
- Writing end-to-end tests
- Setting up Playwright in a project
- Debugging flaky tests
- Adding tests to CI pipeline

## Setup

```bash
npm init playwright@latest
```

## Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'user@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome');
  });
});
```

## Page Object Model

```typescript
class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email"]', email);
    await this.page.fill('[data-testid="password"]', password);
    await this.page.click('[data-testid="login-button"]');
  }

  async expectError(message: string) {
    await expect(this.page.locator('[data-testid="error"]')).toContainText(message);
  }
}
```

## Selector Strategy

| Priority | Selector | Example |
|----------|----------|---------|
| 1 | data-testid | `[data-testid="submit"]` |
| 2 | Role | `getByRole('button', { name: 'Submit' })` |
| 3 | Text | `getByText('Submit')` |
| 4 | CSS (last resort) | `.submit-btn` |

**Avoid:** XPath, nth-child, auto-generated class names

## Visual Regression

```typescript
test('hero section matches snapshot', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero')).toHaveScreenshot('hero.png', {
    maxDiffPixelRatio: 0.01,
  });
});
```

### Breakpoints to Test
- 320px (mobile)
- 768px (tablet)
- 1024px (laptop)
- 1440px (desktop)

## Handling Async

```typescript
// GOOD: Wait for specific elements
await expect(page.locator('.results')).toBeVisible();

// GOOD: Wait for network idle
await page.waitForLoadState('networkidle');

// BAD: Arbitrary timeouts
await page.waitForTimeout(3000); // Flaky!
```

## CI Configuration

```yaml
# GitHub Actions
- name: Run E2E tests
  run: npx playwright test
- uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: playwright-report
    path: playwright-report/
```

## Flaky Test Strategy

| Cause | Fix |
|-------|-----|
| Race condition | Wait for specific element, not timeout |
| Animation | Disable animations in test config |
| Network timing | Mock API responses or wait for networkidle |
| Date-dependent | Mock `Date.now()` |
| Shared state | Isolate test data per test |

## Anti-Patterns

| Don't | Do Instead |
|-------|-----------|
| `waitForTimeout(5000)` | Wait for specific element/event |
| Test implementation details | Test user-visible behavior |
| Share state between tests | Independent test setup |
| Skip flaky tests forever | Fix or quarantine with deadline |
| Screenshot everything | Screenshot key states only |
