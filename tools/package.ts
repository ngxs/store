#! /usr/bin/env node

'use strict';

import { exec } from 'child_process';

import build from './build';

const json = require('../package.json');

const p = packages => {
  const go = i => {
    const m = packages[i];
    const path = m.split('/');
    const name = path[path.length - 1];

    build(m).then(() => {
      exec(`cd builds/${name} && yarn link`, err => {
        if (err) {
          throw new Error(err.message);
        }

        console.log(`${json.packageScope}/${name} linked`);

        if (i < packages.length - 1) {
          go(i + 1);
        }
      });
    });
  };

  return go;
};

// package all modules starting from first in the list
p(json.packages)(0);
