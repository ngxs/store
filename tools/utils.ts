import { exec } from 'child_process';
import { resolve } from 'path';

interface Package {
  name: string;
  packageName: string;
  buildPath: string;
  ngPackagrProjectPath: string;
}

export function getPackages(): Package[] {
  const json = require('../package.json');
  const packages = json.packages;

  return packages.map(pack => {
    const path = pack.split('/');
    const name = path[path.length - 1];
    const packageName = `${json.packageScope}/${name}`;
    const buildPath = resolve(__dirname, '../', 'builds', name);
    const ngPackagrProjectPath = resolve(__dirname, '../', 'packages', name, 'ng-package.json');
    return {
      name,
      packageName,
      buildPath,
      ngPackagrProjectPath
    };
  });
}

export function execute(script: string): Promise<any> {
  return new Promise((resolvePromise, rejectPromise) => {
    exec(script, (error, stdout, stderr) => {
      if (error) {
        rejectPromise(stderr);
      } else {
        resolvePromise(stdout);
      }
    });
  });
}
