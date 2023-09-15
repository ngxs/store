import { Rule, SchematicsException, url } from '@angular-devkit/schematics';
import { StoreSchema } from './store.schema';
import { isEmpty } from '../utils/common/properties';
import { normalizeBaseOptions } from '../utils/normalize-options';
import { generateFiles } from '../utils/generate-utils';
import { join } from 'path';

export function store(options: StoreSchema): Rule {
  if (isEmpty(options.name)) {
    throw new SchematicsException('Invalid options, "name" is required.');
  }

  const normalizedOptions = normalizeBaseOptions(options);
  const path = options.flat
    ? normalizedOptions.path
    : join(normalizedOptions.path, normalizedOptions.name);

  return generateFiles(url('./files'), path, options, options.spec);
}
