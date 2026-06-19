import { defineConfig, devices } from '@playwright/test';

const isSsr = process.env.SSR === 'true';
const isCi = !!process.env.CI;

const serveCommand = isSsr
  ? 'yarn serve:integration:ssr'
  : isCi
    ? 'yarn serve:integration:static'
    : 'yarn serve:integration';

export default defineConfig({
  testDir: './e2e',
  testMatch: isSsr ? 'ssr/**/*.spec.ts' : '*.spec.ts',
  testIgnore: isSsr ? undefined : 'ssr/**',
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
    command: serveCommand,
    url: 'http://localhost:4200',
    reuseExistingServer: !isCi,
    timeout: 180_000
  }
});
