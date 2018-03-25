#! /usr/bin/env node

'use strict';

import build from './build';

const json = require('../package.json');

const p = packages => {
  const go = i => {
    const m = packages[i];

    build(m).then(() => {
      if (i < packages.length - 1) {
        go(i + 1);
      }
    });
  };

  return go;
};

// package all modules starting from first in the list
p(json.packages)(0);
