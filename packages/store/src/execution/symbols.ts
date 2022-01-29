import { InjectionToken, inject, INJECTOR, Type, ɵglobal } from '@angular/core';

import { NoopNgxsExecutionStrategy } from './noop-ngxs-execution-strategy';
import { DispatchOutsideZoneNgxsExecutionStrategy } from './dispatch-outside-zone-ngxs-execution-strategy';

/**
 * The strategy that might be provided by users through `options.executionStrategy`.
 */
export const USER_PROVIDED_NGXS_EXECUTION_STRATEGY = new InjectionToken<
  Type<NgxsExecutionStrategy> | undefined
>('USER_PROVIDED_NGXS_EXECUTION_STRATEGY');

/*
 * Internal execution strategy injection token
 */
export const NGXS_EXECUTION_STRATEGY = new InjectionToken<NgxsExecutionStrategy>(
  'NGXS_EXECUTION_STRATEGY',
  {
    providedIn: 'root',
    factory: () => {
      const injector = inject(INJECTOR);
      const executionStrategy = injector.get(USER_PROVIDED_NGXS_EXECUTION_STRATEGY);
      return executionStrategy
        ? injector.get(executionStrategy)
        : injector.get(
            typeof ɵglobal.Zone !== 'undefined'
              ? DispatchOutsideZoneNgxsExecutionStrategy
              : NoopNgxsExecutionStrategy
          );
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
