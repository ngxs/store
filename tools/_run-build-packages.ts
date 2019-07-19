#!/usr/bin/env node
'use strict';

import { ngPackagr } from 'ng-packagr';
import { buildPackages, getOptionsFromProcessArgs } from './build-packages';

async function main() {
  const options = getOptionsFromProcessArgs();
  await buildPackages(options, ngPackagr);
}

main().catch(err => {
  console.error('Error building ngxs', err);
  process.exit(111);
});
