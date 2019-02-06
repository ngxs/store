import { InjectionToken } from '@angular/core';

export const NGXS_EXECUTION_STRATEGY = new InjectionToken<NgxsExecutionStrategy>(
  'NGXS_EXECUTION_STRATEGY'
);

/*
 * Execution strategy interface
 */
export interface NgxsExecutionStrategy {
  enter<T>(func: (...args: any[]) => T): T;
  leave<T>(func: (...args: any[]) => T): T;
}
