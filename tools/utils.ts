import { exec, ExecOptions } from 'child_process';
import { resolve } from 'path';

export enum ArgvType {
  WATCH = '--watch',
  PACKAGE = '--package'
}

export interface Package {
  name: string;
  packageName: string;
  buildPath: string;
  ngPackagrProjectPath: string;
}

export function getPackages(): Package[] {
  const json = require('../package.json');
  const packages: string[] = json.packages;

  return packages.map(pack => {
    const path = pack.split('/');
    const name = path[path.length - 1];
    const packageName = `${json.packageScope}/${name}`;
    const buildPath = resolve(__dirname, '../', '@ngxs', name);
    const ngPackagrProjectPath = resolve(
      __dirname,
      '../',
      'packages',
      name,
      'ng-package.json'
    );
    return {
      name,
      packageName,
      buildPath,
      ngPackagrProjectPath
    };
  });
}

export function execute(script: string, options: ExecOptions = {}): Promise<string> {
  return new Promise<string>((resolvePromise, rejectPromise) => {
    exec(script, options, (error, stdout, stderr) => {
      if (error) {
        rejectPromise({ error, stderr });
      } else {
        resolvePromise(stdout);
      }
    });
  });
}

export async function publishAllPackagesToNpm(version: any, tag: string) {
  const packages = getPackages();
  for (const pack of packages) {
    try {
      await publishPackage(pack, version, tag);
    } catch (error) {
      // One retry
      await publishPackage(pack, version, tag);
    }
  }
}
async function publishPackage(pack: Package, version: any, tag: string) {
  const packageDescription = `${pack.buildPath} ${version} @${tag}`;
  try {
    // npm publish reads the version from the built package.json, so set it
    // first. `--allow-same-version` makes this a no-op when the version
    // already matches (e.g. tagged release builds).
    await execute(`npm version ${version} --no-git-tag-version --allow-same-version`, {
      cwd: pack.buildPath
    });
    const output = await execute(`npm publish --access public --tag ${tag}`, {
      cwd: pack.buildPath
    });
    console.log(`Published ${packageDescription} /r/n -> ${output}`);
  } catch ({ error, stdErr }) {
    console.log(`Error Publishing ${packageDescription} /r/n -> ${error}`);
    throw error;
  }
}
