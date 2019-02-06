import { InjectionToken } from '@angular/core';

/*
 * Internal execution strategy injection token
 */
export const NGXS_EXECUTION_STRATEGY = new InjectionToken<NgxsExecutionStrategy>(
  'NGXS_EXECUTION_STRATEGY'
);

/*
 * Execution strategy interface
 */
export interface NgxsExecutionStrategy {
  enter<T>(func: () => T): T;
  leave<T>(func: () => T): T;
}
