import { Injectable, InjectionToken, Type, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { StateOperator } from '@ngxs/store/operators';
import { ɵSharedSelectorOptions, ɵStateClass } from '@ngxs/store/internals';

import { NgxsExecutionStrategy } from './execution/symbols';

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
  developmentMode: boolean;
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
   * Determines the execution context to perform async operations inside. An implementation can be
   * provided to override the default behaviour where the async operations are run
   * outside Angular's zone but all observable behaviours of NGXS are run back inside Angular's zone.
   * These observable behaviours are from:
   *   `store.selectSignal(...)`, `store.select(...)`, `actions.subscribe(...)` or `store.dispatch(...).subscribe(...)`
   * Every `zone.run` causes Angular to run change detection on the whole tree (`app.tick()`) so of your
   * application doesn't rely on zone.js running change detection then you can switch to the
   * `NoopNgxsExecutionStrategy` that doesn't interact with zones.
   * (default: null)
   */
  executionStrategy: Type<NgxsExecutionStrategy>;
  /**
   * Defining shared selector options
   */
  selectorOptions: ɵSharedSelectorOptions = {
    injectContainerState: false,
    suppressErrors: false
  };
}

export { StateOperator };

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

export type NgxsModuleOptions = Partial<NgxsConfig> & {
  executionStrategy: Type<NgxsExecutionStrategy>;
};

/** @internal */
declare global {
  const ngDevMode: boolean;
  // Indicates whether the application is operating in server-rendering mode.
  // `ngServerMode` is a global flag set by Angular CLI.
  // https://github.com/angular/angular-cli/blob/b4e9a2af9e50e7b65167d0fdbd4012023135e875/packages/angular/build/src/tools/vite/utils.ts#L102
  const ngServerMode: boolean;
}
