import { test, expect } from '@playwright/test';

// `CounterState` is decorated with `@Service({ autoProvided: false })` (see
// `src/app/store/counter/counter.state.ts`). Unlike the unit tests, this runs against the real
// production/AOT build (`yarn build:prod` served statically), which is the only place that
// exercises how `@Service()` actually compiles and resolves through Angular's DI in a shipped app.
test.describe('@Service()-decorated state (AOT production build)', () => {
  test('should increment via the store and persist the state across a reload', async ({
    page
  }) => {
    await page.goto('/');

    const button = page.locator('button');
    await button.click();
    await button.click();
    await expect(page.locator('p')).toContainText('Counter is 2');

    // Storage plugin persists all state (`keys: '*'`) to `localStorage`. Rehydrating on reload
    // only works if NGXS resolves the exact same `CounterState` instance it registered via
    // `provideStore()` — which is what `autoProvided: false` guarantees.
    await page.reload();

    await expect(page.locator('p')).toContainText('Counter is 2');
  });
});
