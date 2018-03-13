import { NgxsPlugin } from '../../symbols';
import { getTypeFromInstance } from '../../internals';
import { Injectable, Inject } from '@angular/core';
import { DevtoolsExtension, DevtoolsOptions, DEVTOOLS_OPTIONS } from './symbols';

/**
 * Adds support for the Redux Devtools extension:
 * http://extension.remotedev.io/
 */
@Injectable()
export class ReduxDevtoolsPlugin implements NgxsPlugin {
  private readonly devtoolsExtension: DevtoolsExtension | null = null;
  private readonly windowObj: any = typeof window !== 'undefined' ? window : {};

  constructor(@Inject(DEVTOOLS_OPTIONS) private _options: DevtoolsOptions) {
    const globalDevtools = this.windowObj['__REDUX_DEVTOOLS_EXTENSION__'] || this.windowObj['devToolsExtension'];

    if (globalDevtools) {
      this.devtoolsExtension = globalDevtools.connect() as DevtoolsExtension;
    }
  }

  handle(state: any, event: any, next: any) {
    const isDisabled = this._options && this._options.disabled;
    if (!this.devtoolsExtension || isDisabled) {
      return next(state, event);
    }

    // process the state
    state = next(state, event);

    // if init action, send initial state to dev tools
    const isInitAction = getTypeFromInstance(event) === '@@INIT';
    if (isInitAction) {
      this.devtoolsExtension.init(state);
    } else {
      this.devtoolsExtension.send(getTypeFromInstance(event), state);
    }

    // return our newly processed state
    return state;
  }
}
