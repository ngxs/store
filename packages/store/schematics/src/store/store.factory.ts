import { Rule, SchematicsException, Tree, url } from '@angular-devkit/schematics';
import { join } from 'path';
import { isEmpty } from '../../../schematics-utils/src/common/properties';
import { generateFiles } from '../../../schematics-utils/src/generate-utils';
import { isStandaloneApp } from '@schematics/angular/utility/ng-ast-utils';
import { getProjectMainFile } from '../../../schematics-utils/src/project';
import { normalizeBaseOptions } from '../../../schematics-utils/src/normalize-options';
import { StoreSchema } from './store.schema';

export function store(options: StoreSchema): Rule {
  return (host: Tree) => {
    if (isEmpty(options.name)) {
      throw new SchematicsException('Invalid options, "name" is required.');
    }

    let isStandalone = options.standalone;
    if (typeof isStandalone !== 'boolean') {
      const mainFile = getProjectMainFile(host, options.project);
      isStandalone = !!mainFile && isStandaloneApp(host, mainFile);
    }

    const normalizedOptions = normalizeBaseOptions(host, options);
    const path = options.flat
      ? normalizedOptions.path
      : join(normalizedOptions.path, normalizedOptions.name);

    return generateFiles(
      url('./files'),
      path,
      { ...normalizedOptions, isStandalone },
      options.spec
    );
  };
}
