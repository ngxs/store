module.exports = {
  displayName: 'store',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  globals: {},
  coverageDirectory: '../../coverage/packages/store',
  coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/schematics/src/utils/ng-utils/'],
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        isolatedModules: true,
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$'
      }
    ]
  },
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment'
  ]
};
