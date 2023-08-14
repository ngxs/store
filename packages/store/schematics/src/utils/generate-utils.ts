import { strings } from '@angular-devkit/core';
import {
  apply,
  filter,
  move,
  noop,
  template,
  Rule,
  mergeWith,
  Source
} from '@angular-devkit/schematics';

export function generateFiles(
  srcFolder: Source,
  target: string,
  substitutions: {
    [k: string]: any;
  },
  generateSpecs?: boolean
): Rule {
  return mergeWith(
    apply(srcFolder, [
      generateSpecs ? noop() : filter(path => !path.includes('.spec')),
      template({
        template: '',
        ...strings,
        ...substitutions
      }),
      move(target)
    ])
  );
}
