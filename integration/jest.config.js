const { pathsToModuleNameMapper: resolver } = require('ts-jest/utils');
const { compilerOptions } = require('../tsconfig.base');
const CI = process.env['CI'] === 'true';

const moduleNameMapper = resolver(compilerOptions.paths, { prefix: '<rootDir>/../' });
if (!CI) {
  console.log('[DEBUG]: moduleNameMapper');
  console.log(JSON.stringify(moduleNameMapper, null, 4));
}

module.exports = {
  displayName: 'integration',
  preset: '../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$'
    }
  },
  moduleNameMapper,
  coverageDirectory: '../coverage/integration',
  transform: {
    '^.+\\.(ts|js|html)$': 'jest-preset-angular'
  },
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment'
  ]
};
