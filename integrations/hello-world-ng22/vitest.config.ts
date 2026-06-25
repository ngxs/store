import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage/ng22',
      reporter: ['html', 'text-summary']
    },
    environment: 'jsdom',
    reporters: ['default']
  }
});
