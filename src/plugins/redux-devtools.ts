import { Injectable, NgModule, Inject, InjectionToken, ModuleWithProviders } from '@angular/core';

import { NgxsPlugin, NGXS_PLUGINS } from '../symbols';
import { getTypeFromInstance } from '../internals';

/**
 * Interface for the redux-devtools-extension API.
 */
export interface DevtoolsExtension {
  init(state);
  send(action: string, state?: any);
  subscribe(fn: (message: string) => void);
}

export interface DevtoolsOptions {
  disabled: boolean;
}

export const DEVTOOLS_OPTIONS = new InjectionToken('DEVTOOLS_OPTIONS');

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

@NgModule()
export class ReduxDevtoolsPluginModule {
  static forRoot(options?: DevtoolsOptions): ModuleWithProviders {
    return {
      ngModule: ReduxDevtoolsPluginModule,
      providers: [
        {
          provide: NGXS_PLUGINS,
          useClass: ReduxDevtoolsPlugin,
          multi: true
        },
        {
          provide: DEVTOOLS_OPTIONS,
          useValue: options
        }
      ]
    };
  }
}
