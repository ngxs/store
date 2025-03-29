import { InjectionToken, inject } from '@angular/core';

import { NGXS_OPTIONS } from '../symbols';

/**
 * The injection token is used internally to resolve an instance of the execution strategy.
 */
export const NGXS_EXECUTION_STRATEGY = new InjectionToken<NgxsExecutionStrategy>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'NGXS_EXECUTION_STRATEGY' : '',
  {
    providedIn: 'root',
    // Since `executionStrategy` is a `Type<...>`, we should inject it to retrieve an
    // instance. This injection token essentially holds an instance of the
    // execution strategy class.
    factory: () => inject(inject(NGXS_OPTIONS).executionStrategy)
  }
);

/*
 * Execution strategy interface
 */
export interface NgxsExecutionStrategy {
  enter<T>(func: () => T): T;
  leave<T>(func: () => T): T;
}
