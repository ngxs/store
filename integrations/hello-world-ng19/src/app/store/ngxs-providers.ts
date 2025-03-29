import { NoopNgxsExecutionStrategy, provideStore } from '@ngxs/store';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';
import { withNgxsFormPlugin } from '@ngxs/form-plugin';
import { withNgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { withNgxsWebSocketPlugin } from '@ngxs/websocket-plugin';
import { withNgxsRouterPlugin } from '@ngxs/router-plugin';

import { CounterState } from './counter/counter.state';

declare const ngDevMode: boolean;

export function provideNgxs() {
  return provideStore(
    [CounterState],
    {
      executionStrategy: NoopNgxsExecutionStrategy
    },
    withNgxsReduxDevtoolsPlugin({
      disabled: typeof ngDevMode !== 'undefined' && !ngDevMode
    }),
    withNgxsFormPlugin(),
    withNgxsLoggerPlugin({
      disabled: typeof ngDevMode !== 'undefined' && !ngDevMode
    }),
    withNgxsStoragePlugin({ keys: '*' }),
    withNgxsWebSocketPlugin(),
    withNgxsRouterPlugin()
  );
}
