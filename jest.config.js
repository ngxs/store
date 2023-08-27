const { getJestProjects } = require('@nrwl/jest');

globalThis.ngJest = {
  skipNgcc: true
};

module.exports = {
  projects: getJestProjects()
};
