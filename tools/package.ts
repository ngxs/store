#!/usr/bin/env node
'use strict';

import { ngPackagr } from 'ng-packagr';
import { join } from 'path';

import { getPackages } from './utils';

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
        .withTsConfig(join(__dirname, '../tsconfig.build.json'))
        .build();
    } catch (err) {
      console.error('ngPackagr build failed', err);
      throw err;
    }
  }
}

main(process.argv[2]).catch(err => {
  console.error('Error building ngxs', err);
  process.exit(111);
});
