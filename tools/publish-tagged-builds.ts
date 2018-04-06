import { execute, getPackages } from './utils';

async function main() {
  const json = require('../package.json');
  console.log('publishing new version', json.version);

  // run through all our packages and push them to npm
  const packages = getPackages();
  for (const pack of packages) {
    await execute(`
      cd ${pack.buildPath} &&
      yarn publish --access public --non-interactive --no-git-tag-version --new-version ${json.version} --tag latest
    `);
  }
}

main();
