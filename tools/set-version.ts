'use strict';

import { resolve } from 'path';
import { writeFileSync } from 'fs';

const packageJson = require('../package.json');

packageJson.packages.forEach(m => {
  const modulePath = resolve(__dirname, `../builds/${m.split('/')[1]}/package.json`);
  const modulePackage = require(modulePath);
  modulePackage.version = packageJson.version;

  packageJson.packages.forEach(p => {
    const name = packageJson.packageScope + '/' + p.split('/')[1];

    if (modulePackage.peerDependencies[name]) {
      modulePackage.peerDependencies[name] = packageJson.version;
    }
  });

  writeFileSync(modulePath, JSON.stringify(modulePackage, null, 2));

  console.log(`${m} version set to ${packageJson.version}`);
});
