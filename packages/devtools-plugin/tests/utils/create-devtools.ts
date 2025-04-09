import { NgxsDevtoolsOptions } from '@ngxs/devtools-plugin';
import { ɵdefineProperty } from '@ngxs/store/internals';

import { ReduxDevtoolsMockConnector } from './redux-connector';

export function createReduxDevtoolsExtension(connector: ReduxDevtoolsMockConnector): void {
  ɵdefineProperty(window, '__REDUX_DEVTOOLS_EXTENSION__', {
    writable: true,
    configurable: true,
    value: {
      connect(options: NgxsDevtoolsOptions): ReduxDevtoolsMockConnector {
        connector.options = options;
        return connector;
      },
      disconnect() {}
    }
  });
}
