import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage/ng21',
      reporter: ['html', 'text-summary']
    },
    environment: 'jsdom',
    reporters: ['default']
  }
});
