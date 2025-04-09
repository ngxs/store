import { Rule, Tree, url } from '@angular-devkit/schematics';
import { generateFiles } from '../../../schematics-utils/src/generate-utils';
import { isStandaloneApp } from '@schematics/angular/utility/ng-ast-utils';
import { getProjectMainFile } from '../../../schematics-utils/src/project';
import { normalizePath } from '../../../schematics-utils/src/normalize-options';
import { StarterKitSchema } from './starter-kit.schema';

export function starterKit(options: StarterKitSchema): Rule {
  return (host: Tree) => {
    let isStandalone = options.standalone;
    if (typeof isStandalone !== 'boolean') {
      const mainFile = getProjectMainFile(host, options.project);
      isStandalone = !!mainFile && isStandaloneApp(host, mainFile);
    }

    const normalizedPath = normalizePath(options.path);

    return generateFiles(
      url('./files'),
      normalizedPath,
      { ...options, isStandalone },
      options.spec
    );
  };
}
