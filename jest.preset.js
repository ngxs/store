const nxPreset = require('@nrwl/jest/preset').default;

module.exports = {
  ...nxPreset,

  /**
   * By default, Jest runs all tests and produces all errors into the console upon completion.
   * The bail config option can be used here to have Jest stop running tests after n failures.
   * Setting bail to true is the same as setting bail to 1
   */
  bail: true,

  /**
   * Indicates whether the coverage information should be collected while executing the test.
   * Because this retrofits all executed files with coverage collection statements,
   * it may significantly slow down your tests.
   */
  // collectCoverage: CI,

  /**
   * An array of glob patterns indicating a set of files for which coverage
   * information should be collected. If a file matches the specified glob pattern,
   * coverage information will be collected for it even if no tests exist for this file and
   * it's never required in the test suite.
   */
  //   collectCoverageFrom: [
  //     'packages/**/*.ts',
  //     '!packages/**/*.spec.ts',
  //     '!packages/**/*.spec.ts',
  //     '!packages/**/helpers/**',
  //     '!packages/**/types/**',
  //   ],

  /**
   * A list of reporter names that Jest uses when writing coverage reports.
   * Any istanbul reporter can be used.
   * https://github.com/istanbuljs/istanbuljs/tree/master/packages/istanbul-reports/lib
   */
  coverageReporters: ['json', 'lcovonly', 'lcov', 'text', 'html'],

  /**
   * An array of regexp pattern strings that are matched against all
   * test paths before executing the test. If the test path matches any
   * of the patterns, it will be skipped. These pattern strings match against
   * the full path. Use the <rootDir> string token to include the path to your
   * project's root directory to prevent it from accidentally ignoring all of
   * your files in different environments that may have different root directories.
   */
  testPathIgnorePatterns: ['/node_modules/', '/types/', '/helpers/'],

  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],

  /**
   * Indicates whether each individual test should be reported during the run.
   * All errors will also still be shown on the bottom after execution.
   */
  verbose: true,

  /**
   * A number limiting the number of tests that are allowed to run at the same time when
   * using test.concurrent. Any test above this limit will be queued and executed once
   * a slot is released.
   */
  // maxConcurrency: CI ? 1 : 10, // TODO

  /**
   * By default, each test file gets its own independent module registry.
   * Enabling resetModules goes a step further and resets the module registry before running
   * each individual test. This is useful to isolate modules for every test so that local
   * module state doesn't conflict between tests. This can be done programmatically
   * using jest.resetModules().
   */
  resetModules: true,

  /**
   * Automatically clear mock calls and instances between every test.
   * Equivalent to calling jest.clearAllMocks() between each test.
   * This does not remove any mock implementation that may have been provided.
   */
  clearMocks: true
};
