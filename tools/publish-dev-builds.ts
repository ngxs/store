#! /usr/bin/env node

'use strict';

import { exec } from 'child_process';
import { valid, parse, SemVer } from 'semver';

function execute(script: string): Promise<any> {
  return new Promise((resolve, reject) => {
    exec(script, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function main() {
  const json = require('../package.json');

  const packages = json.packages;

  // determine commit from either circle ci or last git commit
  let commit = process.env.CIRCLE_SHA1;
  if (!commit) {
    const lastCommit = await execute('git rev-parse HEAD');
    commit = lastCommit
      .toString()
      .trim()
      .slice(0, 7);
  }

  // construct new version from base version 2.0.0 to become 2.0.0+dev.shortsha
  const version: SemVer = parse(json.version);
  const newVersion = `${version.major}.${version.minor}.${version.patch}-dev.${commit}`;
  // const newVersion = `${json.version}+${commit}`;
  console.log('valid?', valid(newVersion));

  console.log('publishing new version', newVersion);

  // run through all our packages and push them to npm
  for (const pack of packages) {
    const path = pack.split('/');
    const name = path[path.length - 1];

    await execute(`
      cd builds/${name} &&
      yarn publish --access public --non-interactive --no-git-tag-version --new-version ${newVersion} --tag dev
    `);
  }
}

main();
