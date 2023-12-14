import { Rule, Tree, url } from '@angular-devkit/schematics';
import { generateFiles } from '../utils/generate-utils';
import { isStandaloneApp } from '../utils/ng-utils/ng-ast-utils';
import { getProjectMainFile } from '../utils/ng-utils/project';
import { normalizePath } from '../utils/normalize-options';
import { StarterKitSchema } from './starter-kit.schema';

export function starterKit(options: StarterKitSchema): Rule {
  return (host: Tree) => {
    const mainFile = getProjectMainFile(host, options.project);
    const isStandalone = isStandaloneApp(host, mainFile);

    const normalizedPath = normalizePath(options.path);

    return generateFiles(
      url('./files'),
      normalizedPath,
      { ...options, isStandalone },
      options.spec
    );
  };
}
