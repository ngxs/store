import { Injectable, Type } from '@angular/core';

import { ObjectKeyMap } from '../internals';
import { NgxsCompatibility } from '../../symbols';
import { NgxsExecutionStrategy } from '../../execution/symbols';
import { DispatchOutsideZoneNgxsExecutionStrategy } from '../../execution/dispatchOutsideZoneNgxsExecutionStrategy';

/**
 * The NGXS config settings.
 */
@Injectable()
export class NgxsConfig {
  /**
   * Run in development mode. This will add additional debugging features:
   * - Object.freeze on the state and actions to guarantee immutability
   * (default: false)
   */
  developmentMode: boolean;

  /**
   * Support a strict Content Security Policy.
   * This will circumvent some optimisations that violate a strict CSP through the use of `new Function(...)`.
   * (default: { strictContentSecurityPolicy: false })
   */
  compatibility: NgxsCompatibility = {
    strictContentSecurityPolicy: false
  };

  /**
   * Determines the execution context to perform async operations inside. An implementation can be
   * provided to override the default behaviour where the async operations are run
   * outside Angular's zone but all observable behaviours of NGXS are run back inside Angular's zone.
   * These observable behaviours are from:
   *   `@Select(...)`, `store.select(...)`, `actions.subscribe(...)` or `store.dispatch(...).subscribe(...)`
   * Every `zone.run` causes Angular to run change detection on the whole tree (`app.tick()`) so of your
   * application doesn't rely on zone.js running change detection then you can switch to the
   * `NoopNgxsExecutionStrategy` that doesn't interact with zones.
   * (default: DispatchOutsideZoneNgxsExecutionStrategy)
   */
  executionStrategy: Type<NgxsExecutionStrategy> = DispatchOutsideZoneNgxsExecutionStrategy;

  /**
   * Defining the default state before module initialization
   * This is convenient if we need to create a define our own set of states.
   * (default: {})
   */
  defaultsState: ObjectKeyMap<any> = {};
}
