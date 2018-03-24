#! /usr/bin/env node

'use strict';

import { exec } from 'child_process';

import build from './build';

const p = packages => {
  const go = i => {
    const m = packages[i];

    build(m).then(() => {
      exec(`cd ${m} && yarn link`, err => {
        if (err) {
          throw new Error(err.message);
        }

        const path = m.split('/');

        console.log(`${path[path.length - 1]} linked`);

        if (i < packages.length - 1) {
          go(i + 1);
        }
      });
    });
  };

  return go;
};

// package all modules starting from first in the list
p(require('../package.json').packages)(0);
