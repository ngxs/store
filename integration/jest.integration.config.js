const jestRootConfig = require('../jest.config');

module.exports = {
  ...jestRootConfig,
  testMatch: [ "<rootDir>/integration/**/*.spec.ts"],
  collectCoverage: false
};
