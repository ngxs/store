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

/**
 * Common library configuration options.
 */
const configOptions = {
  version: '3.7.3',
  overwrite: true
};

export const LIB_CONFIG: NodeDependency[] = [
  {
    type: NodeDependencyType.Default,
    name: LIBRARIES.DEVTOOLS,
    ...configOptions
  },
  {
    type: NodeDependencyType.Default,
    name: LIBRARIES.FORM,
    ...configOptions
  },
  {
    type: NodeDependencyType.Default,
    name: LIBRARIES.HMR,
    ...configOptions
  },
  {
    type: NodeDependencyType.Default,
    name: LIBRARIES.LOGGER,
    ...configOptions
  },
  {
    type: NodeDependencyType.Default,
    name: LIBRARIES.ROUTER,
    ...configOptions
  },
  {
    type: NodeDependencyType.Default,
    name: LIBRARIES.STORAGE,
    ...configOptions
  },
  {
    type: NodeDependencyType.Default,
    name: LIBRARIES.STORE,
    ...configOptions
  },
  {
    type: NodeDependencyType.Default,
    name: LIBRARIES.WEBSOCKET,
    ...configOptions
  }
];
