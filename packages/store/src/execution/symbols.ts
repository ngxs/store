import { InjectionToken, inject } from '@angular/core';

import { NGXS_OPTIONS } from '../symbols';

/**
 * The injection token is used internally to resolve an instance of the execution
 * strategy. It checks whether consumers have provided their own `executionStrategy`
 * and also verifies if we are operating in a zone-aware environment.
 */
export const NGXS_EXECUTION_STRATEGY = new InjectionToken<NgxsExecutionStrategy>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'NGXS_EXECUTION_STRATEGY' : '',
  {
    providedIn: 'root',
    factory: () => {
      const options = inject(NGXS_OPTIONS);
      return inject(options.executionStrategy!);
    }
  }
);

/*
 * Execution strategy interface
 */
export interface NgxsExecutionStrategy {
  enter<T>(func: () => T): T;
  leave<T>(func: () => T): T;
}
