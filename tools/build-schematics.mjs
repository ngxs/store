import yargs from 'yargs';
import { join } from 'path';
import { execSync } from 'child_process';
import fse from 'fs-extra';
import fs from 'fs';
import minimatch from 'minimatch';

const { projectRoot, distPath } = yargs(process.argv).argv;

if (!distPath) {
  throw new Error('"distPath" is required.');
}

const tsConfigPath = join(projectRoot, 'tsconfig.schematics.json');

const cmd = `node_modules/.bin/tsc -p ${tsConfigPath}`;
console.log(`Running "${cmd}"`);
execSync(cmd, { stdio: 'inherit' });

fse.copySync(
  join(projectRoot, 'schematics/factories'),
  join(distPath, 'schematics/factories'),
  src => {
    const willBeCopied = fs.statSync(src).isDirectory() || src.endsWith('schema.json');
    return willBeCopied;
  }
);

fse.copySync(
  join(projectRoot, 'schematics/templates'),
  join(distPath, 'schematics/templates')
);

fse.copySync(
  join(projectRoot, 'schematics/collection.json'),
  join(distPath, 'schematics/collection.json')
);
