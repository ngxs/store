import { writeFile } from 'fs/promises';

import { getPackages } from './utils';

async function setMetadata() {
  const ngxsJson = require('../package.json');
  const keysToCopy = [
    'version',
    'repository',
    'keywords',
    'author',
    'contributors',
    'license',
    'bugs',
    'homepage',
    'funding'
  ];

  const packages = getPackages();
  for (const pack of packages) {
    const packPath = `${pack.buildPath}/package.json`;
    const packPackage = require(packPath);

    // copy all meta data from the root package.json into all packages
    for (const key of keysToCopy) {
      packPackage[key] = ngxsJson[key];
    }

    // set all the packages peerDependencies to be the same as root package.json version
    for (const packageInfo of packages) {
      if (packPackage.peerDependencies[packageInfo.packageName]) {
        packPackage.peerDependencies[packageInfo.packageName] =
          `^${ngxsJson.version} || ^${ngxsJson.version}-dev`;
      }
    }

    // save the package file after we have updated the keys and peerDependencies
    try {
      await writeFile(packPath, JSON.stringify(packPackage, null, 2));
    } catch {
      console.error('Write failed!');
    }
  }

  console.log(`package version set to ${ngxsJson.version}`);
}

setMetadata();
