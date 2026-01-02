import fs from 'node:fs';
import yargs from 'yargs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const { projectRoot, distPath } = yargs(process.argv).argv;

if (!distPath) {
  throw new Error('"distPath" is required.');
}

const schematicsSrc = join(projectRoot, 'schematics', 'src');
assertSchematicsVersionIsUpToDate(schematicsSrc);

const tsConfigPath = join(projectRoot, 'tsconfig.schematics.json');

const tscExecutable = join(...['node_modules', '.bin', 'tsc']);

const cmd = `${tscExecutable} -p ${tsConfigPath}`;
console.log(`Running "${cmd}"`);
execSync(cmd, { stdio: 'inherit' });

fs.cpSync(schematicsSrc, join(distPath, 'schematics', 'src'), {
  recursive: true,
  filter: src => {
    // skip not compiled files
    return !src.endsWith('.ts');
  }
});

fs.copyFileSync(
  join(projectRoot, 'schematics', 'collection.json'),
  join(distPath, 'schematics', 'collection.json')
);

function assertSchematicsVersionIsUpToDate(schematicsSrc) {
  const rootPkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf-8' }));
  const schematicsVersionsFilePath = join(schematicsSrc, 'utils', 'versions.json');
  const schematicsVersionsFile = JSON.parse(
    fs.readFileSync(schematicsVersionsFilePath, { encoding: 'utf-8' })
  );
  if (rootPkg.version !== schematicsVersionsFile['@ngxs/store']) {
    throw new Error(
      `Version of "@ngxs/store" in "${schematicsVersionsFilePath}" is not up to date with root package.json`
    );
  }
}
