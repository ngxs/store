import { test, expect } from '@playwright/test';

test.describe('List page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/list');
  });

  test('should contain form with "h3" title', async ({ page }) => {
    await expect(page.locator('.todo-list h3').first()).toHaveText('Reactive Form');
  });
});
