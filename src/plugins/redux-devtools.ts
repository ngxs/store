import { NgxsPlugin } from '../symbols';
import { Injectable } from '@angular/core';

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
      /**
       * todo: initial state sending is not possible due to DI problem in the constructor (injections are undefined).
       * Possible implementation:
       * (this.ngxs.select(state => state) as Observable<any>)
       *   .pipe(first())
       *   .subscribe(state => this.devtoolsExtension.init(state));
       */
      this.devtoolsExtension.init({});
    }
  }

  handle(state: any, action: any) {
    if (!this.devtoolsExtension) {
      return;
    }
    this.devtoolsExtension.send(action.constructor.name, state);
  }
}
