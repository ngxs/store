import { Rule, SchematicsException, Tree, url } from '@angular-devkit/schematics';
import { join } from 'path';
import { isEmpty } from '../utils/common/properties';
import { generateFiles } from '../utils/generate-utils';
import { isStandaloneApp } from '../utils/ng-utils/ng-ast-utils';
import { getProjectMainFile } from '../utils/ng-utils/project';
import { normalizeBaseOptions } from '../utils/normalize-options';
import { StateSchema } from './state.schema';

export function state(options: StateSchema): Rule {
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
