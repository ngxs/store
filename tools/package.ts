#!/usr/bin/env node
'use strict';

import { remove } from 'fs-extra';
import { execute, getPackages } from './utils';
import { ngPackagr } from 'ng-packagr';

async function main(specificPackage?: string) {
  // get all packages
  let packages = getPackages();

  // build a specific package that is passed via the command line
  // `yarn build:packages router-plugin`
  if (specificPackage) {
    console.log(`Specific: ${specificPackage}`);
    packages = packages.filter(p => p.name === specificPackage);
  }

  // run through all our packages and build and link them
  for (const pack of packages) {
    // build package
    try {
      await ngPackagr()
        .forProject(pack.ngPackagrProjectPath)
        .build();
    } catch (err) {
      console.error('ngPackagr build failed', err);
      throw err;
    }

    // link the packages so they can find each other
    try {
      await execute(`npm link ${pack.buildPath}`);
      await remove(`${pack.buildPath}/package-lock.json`);
      await remove(`${pack.buildPath}/node_modules`);

      console.log(`${pack.packageName} linked`);
    } catch (err) {
      console.log('failed to link npm builds', err);
      throw err;
    }
  }
}

main(process.argv[2]).catch(err => {
  console.error('Error building ngxs', err);
  process.exit(111);
});
