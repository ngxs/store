import { NgxsPlugin } from '../symbols';
import { Injectable } from '@angular/core';
import { getTypeFromInstance } from '../internals';

/**
 * Interface for the redux-devtools-extension API.
 */
export interface DevtoolsExtension {
  init(state);
  send(action: string, state?: any);
  subscribe(fn: (message: string) => void);
}

/**
 * Adds support for the Redux Devtools extension:
 * http://extension.remotedev.io/
 */
@Injectable()
export class ReduxDevtoolsPlugin implements NgxsPlugin {
  private readonly devtoolsExtension: DevtoolsExtension | null = null;
  private readonly windowObj: any = typeof window !== 'undefined' ? window : {};

  constructor() {
    const globalDevtools = this.windowObj['__REDUX_DEVTOOLS_EXTENSION__'] || this.windowObj['devToolsExtension'];
    if (globalDevtools) {
      this.devtoolsExtension = globalDevtools.connect() as DevtoolsExtension;
    }
  }

  handle(state: any, event: any, next: any) {
    if (!this.devtoolsExtension) {
      return next(state, event);
    }

    const isInitAction = getTypeFromInstance(event) === '@@INIT';
    if (isInitAction) {
      this.devtoolsExtension.init(state);
    } else {
      this.devtoolsExtension.send(getTypeFromInstance(event), state);
    }

    return next(state, event);
  }
}
