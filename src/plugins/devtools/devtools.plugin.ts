import { NgxsPlugin } from '../../symbols';
import { getTypeFromInstance } from '../../internals';
import { Injectable, Inject } from '@angular/core';
import { NgxsDevtoolsExtension, NgxsDevtoolsOptions, NGXS_DEVTOOLS_OPTIONS } from './symbols';

/**
 * Adds support for the Redux Devtools extension:
 * http://extension.remotedev.io/
 */
@Injectable()
export class NgxsReduxDevtoolsPlugin implements NgxsPlugin {
  private readonly devtoolsExtension: NgxsDevtoolsExtension | null = null;
  private readonly windowObj: any = typeof window !== 'undefined' ? window : {};

  constructor(@Inject(NGXS_DEVTOOLS_OPTIONS) private _options: NgxsDevtoolsOptions) {
    const globalDevtools = this.windowObj['__REDUX_DEVTOOLS_EXTENSION__'] || this.windowObj['devToolsExtension'];

    if (globalDevtools) {
      this.devtoolsExtension = globalDevtools.connect() as NgxsDevtoolsExtension;
    }
  }

  handle(state: any, action: any, next: any) {
    const isDisabled = this._options && this._options.disabled;
    if (!this.devtoolsExtension || isDisabled) {
      return next(state, action);
    }

    // process the state
    const res = next(state, action);

    res.subscribe(newState => {
      // if init action, send initial state to dev tools
      const isInitAction = getTypeFromInstance(action) === '@@INIT';
      if (isInitAction) {
        this.devtoolsExtension.init(state);
      } else {
        this.devtoolsExtension.send(getTypeFromInstance(action), state);
      }
    });

    return res;
  }
}
