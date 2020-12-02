import { NodeDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';

export enum LIBRARIES {
  STORE = '@ngxs/store',
  LOGGER = '@ngxs/logger-plugin',
  DEVTOOLS = '@ngxs/devtools-plugin'
}

export const LIB_CONFIG: NodeDependency[] = [
  {
    type: NodeDependencyType.Default,
    name: LIBRARIES.DEVTOOLS,
    version: '^3.3.2',
    overwrite: true
  },
  {
    type: NodeDependencyType.Default,
    name: LIBRARIES.LOGGER,
    version: '^3.3.2',
    overwrite: true
  },
  {
    type: NodeDependencyType.Default,
    name: LIBRARIES.STORE,
    version: '^3.3.2',
    overwrite: true
  }
];
