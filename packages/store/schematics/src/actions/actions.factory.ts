import { Rule, SchematicsException, url } from '@angular-devkit/schematics';
import { ActionsSchema } from './actions.schema';
import { generateFiles } from '../utils/generate-utils';
import { isEmpty } from '../utils/common/properties';
import { normalizeBaseOptions } from '../utils/normalize-options';
import { join } from 'path';

export function actions(options: ActionsSchema): Rule {
  if (isEmpty(options.name)) {
    throw new SchematicsException('Invalid options, "name" is required.');
  }

  const normalizedOptions = normalizeBaseOptions(options);
  const path = options.flat
    ? normalizedOptions.path
    : join(normalizedOptions.path, normalizedOptions.name);

  return generateFiles(url('./files'), path, {
    name: normalizedOptions.name
  });
}
