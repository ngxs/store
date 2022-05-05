import { NodeDependency, NodeDependencyType } from '@schematics/angular/utility/dependencies';

export enum LIBRARIES {
  DEVTOOLS = '@ngxs/devtools-plugin',
  FORM = '@ngxs/form-plugin',
  HMR = '@ngxs/hmr-plugin',
  LOGGER = '@ngxs/logger-plugin',
  ROUTER = '@ngxs/router-plugin',
  STORAGE = '@ngxs/storage-plugin',
  STORE = '@ngxs/store',
  WEBSOCKET = '@ngxs/websocket-plugin'
}

export const LIB_CONFIG: NodeDependency[] = [
  {
    type: NodeDependencyType.Default,
    name: LIBRARIES.DEVTOOLS,
    version: '3.7.3',
    overwrite: true
  },
  {
    type: NodeDependencyType.Default,
    name: LIBRARIES.FORM,
    version: '3.7.3',
    overwrite: true
  },
  {
    type: NodeDependencyType.Default,
    name: LIBRARIES.HMR,
    version: '3.7.3',
    overwrite: true
  },
  {
    type: NodeDependencyType.Default,
    name: LIBRARIES.LOGGER,
    version: '3.7.3',
    overwrite: true
  },
  {
    type: NodeDependencyType.Default,
    name: LIBRARIES.ROUTER,
    version: '3.7.3',
    overwrite: true
  },
  {
    type: NodeDependencyType.Default,
    name: LIBRARIES.STORAGE,
    version: '3.7.3',
    overwrite: true
  },
  {
    type: NodeDependencyType.Default,
    name: LIBRARIES.STORE,
    version: '3.7.3',
    overwrite: true
  },
  {
    type: NodeDependencyType.Default,
    name: LIBRARIES.WEBSOCKET,
    version: '3.7.3',
    overwrite: true
  }
];
