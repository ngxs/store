const nxPreset = require('@nrwl/jest/preset').default;
const { pathsToModuleNameMapper } = require('ts-jest');

const { compilerOptions } = require('./tsconfig.base.json');

module.exports = {
  ...nxPreset,
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  transform: {
    '^.+.(ts|mjs|js|html)$': 'jest-preset-angular'
  },
  testPathIgnorePatterns: ['/node_modules/', '/types/', '/helpers/'],
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  resolver: '@nrwl/jest/plugins/resolver',
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageReporters: ['json', 'lcovonly', 'lcov', 'text', 'html'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: process.cwd()
  })
};
