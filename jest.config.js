const { getJestProjectsAsync } = require('@nx/jest');

globalThis.ngJest = {
  skipNgcc: true
};

module.exports = async () => ({
  projects: await getJestProjectsAsync()
});
