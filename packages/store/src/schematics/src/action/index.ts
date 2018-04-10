import {
  Rule,
  SchematicContext,
  Tree,
  apply,
  chain,
  mergeWith,
  template,
  url,
} from '@angular-devkit/schematics';
import { classify, dasherize } from '@angular-devkit/core/src/utils/strings';

const stringUtils = { classify, dasherize };

export default function (options: any): Rule {
  return chain([
    (_tree: Tree, context: SchematicContext) => {
      context.logger.info('My Full Schematic: ' + JSON.stringify(options));
    },

    mergeWith(apply(url('./files'), [
      template({
        ...stringUtils,
        name: options.name,
        state: options.state
      }),
    ])),
  ]);
}
