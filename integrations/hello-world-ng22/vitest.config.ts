import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Force the integration's local @angular/compiler (v22) to load first
    // so it sets globalThis.ng.ɵcompilerFacade before any partial-Ivy
    // static initializer (e.g. @angular/forms's RadioControlRegistry) fires.
    // Without this, the root workspace's @angular/compiler@20 can win the
    // race, leaving the facade without the v22-renamed
    // compileServiceDeclaration method.
    setupFiles: ['@angular/compiler'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage/ng22',
      reporter: ['html', 'text-summary']
    },
    environment: 'jsdom',
    reporters: ['default']
  }
});
