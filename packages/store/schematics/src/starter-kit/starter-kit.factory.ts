import { Rule, url } from '@angular-devkit/schematics';
import { StarterKitSchema } from './starter-kit.schema';
import { normalizePath } from '../utils/normalize-options';
import { generateFiles } from '../utils/generate-utils';

export function starterKit(options: StarterKitSchema): Rule {
  const normalizedPath = normalizePath(options.path);

  return generateFiles(url('./files'), normalizedPath, options, options.spec);
}
