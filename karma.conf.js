// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const CI = process.env['CI'] === 'true';

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, 'coverage'),
      reports: ['html', 'lcovonly'],
      fixWebpackSourcePaths: true
    },
    angularCli: {
      environment: 'production'
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browserConsoleLogOptions: {
      level: CI ? 'error' : 'debug',
      format: '%b %T: %m',
      terminal: true
    },
    autoWatch: !CI,
    browsers: ['Chrome'],
    singleRun: CI
  });
};
