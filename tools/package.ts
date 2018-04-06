#!/usr/bin/env node
'use strict';

import { remove } from 'fs-extra';
import { execute, getPackages } from './utils';
import { ngPackagr } from 'ng-packagr';

async function main() {
  // run through all our packages and build and link them
  const packages = getPackages();
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

main().catch(err => {
  console.error('Error building ngxs', err);
  process.exit(111);
});
