import { defineConfig, devices } from '@playwright/test';

const isCi = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  reporter: isCi ? [['github'], ['list']] : 'list',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:4200',
    navigationTimeout: 120_000,
    actionTimeout: 60_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'yarn serve:integration:static',
    url: 'http://localhost:4200',
    reuseExistingServer: !isCi,
    timeout: 180_000
  }
});
