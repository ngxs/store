#!/usr/bin/env node
'use strict';

import { ngPackagr } from 'ng-packagr';
import { join } from 'path';
import { ArgvType, getPackages } from './utils';

async function main(options: string[]) {
  // get all packages
  let packages = getPackages();

  const packageFlag: number = options.indexOf(ArgvType.PACKAGE);
  const specificPackage: string = packageFlag > -1 ? options[packageFlag + 1] : '';
  const watch: boolean = options.includes(ArgvType.WATCH);

  // build a specific package that is passed via the command line
  // `yarn build:packages --package router-plugin`
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
        .withOptions({ watch })
        .withTsConfig(join(__dirname, '../tsconfig.build.json'))
        .build();
    } catch (err) {
      console.error('ngPackagr build failed', err);
      throw err;
    }
  }
}

const argv: string[] = process.argv.slice(2, process.argv.length) || [];

main(argv).catch(err => {
  console.error('Error building ngxs', err);
  process.exit(111);
});
