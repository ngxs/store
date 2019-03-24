const CI = process.env['CI'] === 'true';
process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-mocha-reporter'),
      require('karma-jasmine-diff-reporter'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: { clearContext: false },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, 'coverage'),
      reports: ['html', 'lcovonly'],
      fixWebpackSourcePaths: true
    },
    angularCli: { environment: 'production' },
    reporters: ['jasmine-diff', 'mocha', 'kjhtml'],
    mochaReporter: { output: 'minimal' },
    port: 9876,
    colors: true,
    failOnEmptyTestSuite: false,
    logLevel: config.LOG_INFO,
    browserConsoleLogOptions: {
      level: CI ? 'error' : 'debug',
      format: '%b %T: %m',
      terminal: true
    },
    autoWatch: !CI,
    browsers: [CI ? 'ChromeHeadless' : 'Chrome'],
    singleRun: CI
  });
};
