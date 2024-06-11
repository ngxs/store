import { defineConfig } from 'cypress';

const isSsr = process.env.SSR === 'true';

export default defineConfig({
  video: false,
  screenshotOnRunFailure: false,
  responseTimeout: 60000,
  pageLoadTimeout: 120000,
  e2e: {
    supportFile: false,
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config);
    },
    baseUrl: 'http://localhost:4200',
    excludeSpecPattern: ['**/plugins/**.js', '**/tsconfig.json'],
    specPattern: isSsr ? './cypress/ssr/*.ts' : './cypress/e2e/*.ts'
  }
});
