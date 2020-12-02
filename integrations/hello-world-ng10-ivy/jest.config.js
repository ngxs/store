const path = require('path');

module.exports = {
  displayName: 'hello-world-ng10-ivy',
  rootDir: path.resolve(),
  testMatch: ['<rootDir>/src/**/**/*.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.spec.json',
      allowSyntheticDefaultImports: true
    }
  }
};
