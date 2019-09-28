import { NgxsDevtoolsOptions } from '@ngxs/devtools-plugin';
import { ReduxDevtoolsMockConnector } from './redux-connector';

export function createReduxDevtoolsExtension(connector: ReduxDevtoolsMockConnector): void {
  Object.defineProperty(window, '__REDUX_DEVTOOLS_EXTENSION__', {
    writable: true,
    configurable: true,
    value: {
      connect(options: NgxsDevtoolsOptions): ReduxDevtoolsMockConnector {
        connector.options = options;
        return connector;
      }
    }
  });
}
