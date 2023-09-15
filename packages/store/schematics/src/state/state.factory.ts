import { Rule, SchematicsException, url } from '@angular-devkit/schematics';
import { StateSchema } from './state.schema';
import { isEmpty } from '../utils/common/properties';
import { normalizeBaseOptions } from '../utils/normalize-options';
import { generateFiles } from '../utils/generate-utils';
import { join } from 'path';

export function state(options: StateSchema): Rule {
  if (isEmpty(options.name)) {
    throw new SchematicsException('Invalid options, "name" is required.');
  }

  const normalizedOptions = normalizeBaseOptions(options);
  const path = options.flat
    ? normalizedOptions.path
    : join(normalizedOptions.path, normalizedOptions.name);

  return generateFiles(url('./files'), path, options, options.spec);
}
