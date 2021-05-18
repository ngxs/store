const webpack = require('@cypress/webpack-preprocessor');

const webpackOptions = require('./cypress-webpack.config');

module.exports = on => {
  const options = { webpackOptions };
  on('file:preprocessor', webpack(options));
};
