#!/usr/bin/env node
'use strict';

import { ngPackagr } from 'ng-packagr';
import { join, resolve } from 'path';
import { copy, ensureDirSync } from 'fs-extra';

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

  // copy schematics
  const source = resolve(__dirname, '../', 'packages', 'store', 'src', 'schematics');
  const destination = resolve(__dirname, '../', 'builds', 'store', 'schematics');
  ensureDirSync(destination);

  copy(source, destination)
    .then(() => console.log('Copy completed!'))
    .catch(err => {
      console.log('An error occured while copying the folder.');
      return console.error(err);
    });
}

main(process.argv[2]).catch(err => {
  console.error('Error building ngxs', err);
  process.exit(111);
});
