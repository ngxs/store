'use strict';

import { resolve } from 'path';
import { writeFileSync } from 'fs';

const ngxsJson = require('../package.json');

const keysToCopy = ['version', 'repository', 'keywords', 'author', 'contributors', 'license', 'bugs', 'homepage'];

ngxsJson.packages.forEach(m => {
  const modulePath = resolve(__dirname, `../builds/${m.split('/')[1]}/package.json`);
  const modulePackage = require(modulePath);

  // copy all meta data from the root package.json into all packages
  for (const key of keysToCopy) {
    modulePackage[key] = ngxsJson[key];
  }

  // set all the packages peerDependencies to be the same as root package.json version
  ngxsJson.packages.forEach(p => {
    const name = ngxsJson.packageScope + '/' + p.split('/')[1];
    if (modulePackage.peerDependencies[name]) {
      modulePackage.peerDependencies[name] = ngxsJson.version;
    }
  });

  writeFileSync(modulePath, JSON.stringify(modulePackage, null, 2));

  console.log(`${m} version set to ${ngxsJson.version}`);
});
