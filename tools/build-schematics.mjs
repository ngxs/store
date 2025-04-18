import yargs from 'yargs';
import { join } from 'path';
import { execSync } from 'child_process';
import fse from 'fs-extra';

const { projectRoot, distPath } = yargs(process.argv).argv;

if (!distPath) {
  throw new Error('"distPath" is required.');
}

const schematicsSrc = join(projectRoot, 'schematics', 'src');
const schematicsUtilSrc = join(projectRoot, 'schematics-utils', 'src');
const migrationsSrc = join(projectRoot, 'migrations', 'src');
assertSchematicsVersionIsUpToDate(schematicsUtilSrc);

const tsConfigPath = join(projectRoot, 'tsconfig.schematics.json');

const tscExecutable = join(...['node_modules', '.bin', 'tsc']);

const cmd = `${tscExecutable} -p ${tsConfigPath}`;
console.log(`Running "${cmd}"`);
execSync(cmd, { stdio: 'inherit' });

fse.copySync(schematicsSrc, join(distPath, 'schematics', 'src'), src => {
  // skip not compiled files
  if (src.endsWith('.ts')) {
    return false;
  }
  return true;
});

fse.copySync(
  join(projectRoot, 'schematics', 'collection.json'),
  join(distPath, 'schematics', 'collection.json')
);

if (fse.existsSync(migrationsSrc)) {
  fse.copySync(migrationsSrc, join(distPath, 'migrations', 'src'), src => {
    // skip not compiled files
    if (src.endsWith('.ts')) {
      return false;
    }
    return true;
  });

  fse.copySync(
    join(projectRoot, 'migrations', 'migrations.json'),
    join(distPath, 'migrations', 'migrations.json')
  );
}

function assertSchematicsVersionIsUpToDate(schematicsSrc) {
  const rootPkg = JSON.parse(fse.readFileSync('package.json', { encoding: 'utf-8' }));
  const schematicsVersionsFilePath = join(schematicsSrc, 'versions.json');
  const schematicsVersionsFile = JSON.parse(
    fse.readFileSync(schematicsVersionsFilePath, { encoding: 'utf-8' })
  );
  if (rootPkg.version !== schematicsVersionsFile['@ngxs/store']) {
    throw new Error(
      `Version of "@ngxs/store" in "${schematicsVersionsFilePath}" is not up to date with root package.json`
    );
  }
}
