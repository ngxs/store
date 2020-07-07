import { NodeDependencyType, NodeDependency } from '@schematics/angular/utility/dependencies';

import { LIB_CONFIG } from './common/lib.config';

export function depsToAdd(type: NodeDependencyType): string[] {
  return LIB_CONFIG.filter((pkg: NodeDependency) => pkg.type === type)
    .reduce((acc, pkg) => [...acc, pkg.name], [])
    .sort();
}
