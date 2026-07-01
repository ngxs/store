import { test, expect } from '@playwright/test';

test.describe('Index page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should render application using the latest version', async ({ page }) => {
    await expect(page.locator('app-root')).toHaveAttribute('ng-version', /^22\./);
  });

  test('should click on the button and increase the counter', async ({ page }) => {
    const button = page.locator('button');
    await button.click();
    await button.click();
    await button.click();
    await expect(page.locator('p')).toContainText('Counter is 3');
  });
});
