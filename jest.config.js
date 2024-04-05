const { getJestProjects } = require('@nx/jest');

globalThis.ngJest = {
  skipNgcc: true
};

module.exports = {
  projects: getJestProjects()
};
