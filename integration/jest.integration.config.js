const jestRootConfig = require('../jest.config');

module.exports = {
  ...jestRootConfig,
  displayName: 'integration',
  projects: ['<rootDir>/integration'],
  testMatch: ['<rootDir>/integration/**/*.spec.ts'],
  collectCoverage: false
};
