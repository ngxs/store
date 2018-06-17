import { Tree } from '@angular-devkit/schematics';

/**
 * Adds a package to the package.json
 * https://github.com/angular/material2/blob/48dda505f78ba82be385b025c6c5eb5ff51e8a84/src/lib/schematics/utils/package.ts
 */
export function addPackageToPackageJson(host: Tree, type: string, pkg: string, version: string): Tree {
  if (host.exists('package.json')) {
    const sourceText = host.read('package.json').toString('utf-8');
    const json = JSON.parse(sourceText);
    if (!json[type]) {
      json[type] = {};
    }

    if (!json[type][pkg]) {
      json[type][pkg] = version;
    }

    host.overwrite('package.json', JSON.stringify(json, null, 2));
  }

  return host;
}
