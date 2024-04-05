module.exports = {
  displayName: 'storage-plugin',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  globals: {},
  coverageDirectory: '../../coverage/packages/storage-plugin',
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
