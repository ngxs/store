import { Rule, SchematicsException, Tree, url } from '@angular-devkit/schematics';
import { join } from 'path';
import { isEmpty } from '../utils/common/properties';
import { generateFiles } from '../utils/generate-utils';
import { isStandaloneApp } from '../utils/ng-utils/ng-ast-utils';
import { getProjectMainFile } from '../utils/ng-utils/project';
import { normalizeBaseOptions } from '../utils/normalize-options';
import { StoreSchema } from './store.schema';

export function store(options: StoreSchema): Rule {
  return (host: Tree) => {
    if (isEmpty(options.name)) {
      throw new SchematicsException('Invalid options, "name" is required.');
    }

    const mainFile = getProjectMainFile(host, options.project);
    const isStandalone = isStandaloneApp(host, mainFile);

    const normalizedOptions = normalizeBaseOptions(options);
    const path = options.flat
      ? normalizedOptions.path
      : join(normalizedOptions.path, normalizedOptions.name);

    return generateFiles(url('./files'), path, { ...options, isStandalone }, options.spec);
  };
}
