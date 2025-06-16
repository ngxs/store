import { Injectable, InjectionToken, inject } from '@angular/core';
import type { Observable } from 'rxjs';

import { StateOperator } from '@ngxs/store/operators';
import { ɵSharedSelectorOptions, ɵStateClass } from '@ngxs/store/internals';

// The injection token is used to resolve a list of states provided at
// the root level through either `NgxsModule.forRoot` or `provideStore`.
export const ROOT_STATE_TOKEN = new InjectionToken<Array<ɵStateClass>>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'ROOT_STATE_TOKEN' : ''
);

// The injection token is used to resolve a list of states provided at
// the feature level through either `NgxsModule.forFeature` or `provideStates`.
// The Array<Array> is used to overload the resolved value of the token because
// it is a multi-provider token.
export const FEATURE_STATE_TOKEN = new InjectionToken<Array<Array<ɵStateClass>>>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'FEATURE_STATE_TOKEN' : ''
);

// The injection token is used to resolve to options provided at the root
// level through either `NgxsModule.forRoot` or `provideStore`.
export const NGXS_OPTIONS = new InjectionToken<NgxsModuleOptions>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'NGXS_OPTIONS' : ''
);

export type NgxsLifeCycle = Partial<NgxsOnChanges> &
  Partial<NgxsOnInit> &
  Partial<NgxsAfterBootstrap>;

/**
 * The NGXS config settings.
 */
@Injectable({
  providedIn: 'root',
  useFactory: (): NgxsConfig => {
    const defaultConfig = new NgxsConfig();
    const config = inject(NGXS_OPTIONS);
    return {
      ...defaultConfig,
      ...config,
      selectorOptions: {
        ...defaultConfig.selectorOptions,
        ...config.selectorOptions
      }
    };
  }
})
export class NgxsConfig {
  /**
   * Run in development mode. This will add additional debugging features:
   * - Object.freeze on the state and actions to guarantee immutability
   * (default: false)
   *
   * Note: this property will be accounted only in development mode.
   * It makes sense to use it only during development to ensure there're no state mutations.
   * When building for production, the `Object.freeze` will be tree-shaken away.
   */
  developmentMode!: boolean;
  compatibility: {
    /**
     * Support a strict Content Security Policy.
     * This will circumvent some optimisations that violate a strict CSP through the use of `new Function(...)`.
     * (default: false)
     */
    strictContentSecurityPolicy: boolean;
  } = {
    strictContentSecurityPolicy: false
  };
  /**
   * Defining shared selector options
   */
  selectorOptions: ɵSharedSelectorOptions = {
    injectContainerState: false,
    suppressErrors: false
  };
}

export type { StateOperator };

/**
 * State context provided to the actions in the state.
 */
export interface StateContext<T> {
  /**
   * Get the current state.
   */
  getState(): T;

  /**
   * Reset the state to a new value.
   */
  setState(val: T | StateOperator<T>): void;

  /**
   * Patch the existing state with the provided value.
   */
  patchState(val: Partial<T>): void;

  /**
   * Dispatch a new action and return the dispatched observable.
   */
  dispatch(actions: any | any[]): Observable<void>;
}

/**
 * Represents a basic change from a previous to a new value for a single state instance.
 * Passed as a value in a NgxsSimpleChanges object to the ngxsOnChanges hook.
 */
export class NgxsSimpleChange<T = any> {
  constructor(
    public readonly previousValue: T,
    public readonly currentValue: T,
    public readonly firstChange: boolean
  ) {}
}

/**
 * On init interface
 */
export interface NgxsOnInit {
  ngxsOnInit(ctx: StateContext<any>): void;
}

/**
 * On change interface
 */
export interface NgxsOnChanges {
  ngxsOnChanges(change: NgxsSimpleChange): void;
}

/**
 * After bootstrap interface
 */
export interface NgxsAfterBootstrap {
  ngxsAfterBootstrap(ctx: StateContext<any>): void;
}

export type NgxsModuleOptions = Partial<NgxsConfig>;
