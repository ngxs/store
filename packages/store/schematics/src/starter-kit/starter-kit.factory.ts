import { Rule, Tree, url } from '@angular-devkit/schematics';
import { generateFiles } from '../utils/generate-utils';
import { isStandaloneApp } from '@schematics/angular/utility/ng-ast-utils';
import { getProjectMainFile } from '../utils/project';
import { normalizePath } from '../utils/normalize-options';
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
