const jestRootConfig = require('../jest.config');

module.exports = {
  ...jestRootConfig,
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/integration/tsconfig.spec.json'
    }
  },
  displayName: 'integration',
  projects: ['<rootDir>/integration'],
  testMatch: ['<rootDir>/integration/**/*.spec.ts'],
  collectCoverage: false
};
