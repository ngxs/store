#! /usr/bin/env node

'use strict';

import { exec } from 'child_process';
import { readJsonSync } from 'fs-extra';

const projectPackageJson = readJsonSync(`${process.cwd()}/package.json`);

projectPackageJson.packages.forEach(m => {
  exec(`cd ${m} && yarn link`, err => {
    if (err) {
      console.error(err);
    }

    const path = m.split('/');

    console.log(`${path[path.length - 1]} linked`);
  });
});
