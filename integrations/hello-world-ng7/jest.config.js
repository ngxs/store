const path = require('path');

module.exports = {
  displayName: 'ngxs-ivy',
  rootDir: path.resolve(),
  testMatch: ['<rootDir>/src/**/**/*.spec.ts'],
  astTransformers: {
    before: [
      'jest-preset-angular/build/InlineFilesTransformer',
      'jest-preset-angular/build/StripStylesTransformer'
    ]
  }
};
