import { exec, ExecOptions } from 'child_process';
import { resolve } from 'path';

export enum ArgvType {
  WATCH = '--watch',
  PACKAGE = '--package'
}

interface Package {
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
    const ngPackagrProjectPath = resolve(__dirname, '../', 'packages', name, 'package.json');
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
    const packageDescription = `${pack.buildPath} ${version} @${tag}`;
    try {
      const script = `yarn publish --access public --non-interactive --no-git-tag-version --new-version ${version} --tag ${tag}`;
      const output = await execute(script, { cwd: pack.buildPath });
      console.log(`Published ${packageDescription} /r/n -> ${output}`);
    } catch ({ error, stdErr }) {
      console.log(`Error Publishing ${packageDescription} /r/n -> ${error}`);
      throw error;
    }
  }
}
