const updateArgv = require('./update-argv');
const path = require('path');

module.exports = function (paths, callback = () => {}) {
  const plopfilePath = path.resolve(...paths);
  process.argv = updateArgv('--plopfile', plopfilePath);
  callback();
  return plopfilePath;
};
