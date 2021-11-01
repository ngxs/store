import { publishAllPackagesToNpm } from './utils';

async function main() {
  const json = require('../package.json');
  console.log('publishing new version', json.version);

  // run through all our packages and push them to npm
  await publishAllPackagesToNpm(json.version, 'latest');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
