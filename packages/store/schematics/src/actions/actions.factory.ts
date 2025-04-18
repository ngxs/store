import { Rule, SchematicsException, url, Tree } from '@angular-devkit/schematics';
import { ActionsSchema } from './actions.schema';
import { generateFiles } from '../../../schematics-utils/src/generate-utils';
import { isEmpty } from '../../../schematics-utils/src/common/properties';
import { normalizeBaseOptions } from '../../../schematics-utils/src/normalize-options';
import { join } from 'path';

export function actions(options: ActionsSchema): Rule {
  return (host: Tree) => {
    if (isEmpty(options.name)) {
      throw new SchematicsException('Invalid options, "name" is required.');
    }

    const normalizedOptions = normalizeBaseOptions(host, options);
    const path = options.flat
      ? normalizedOptions.path
      : join(normalizedOptions.path, normalizedOptions.name);

    return generateFiles(url('./files'), path, {
      name: normalizedOptions.name
    });
  };
}
