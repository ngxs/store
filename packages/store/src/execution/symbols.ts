import { InjectionToken, inject, INJECTOR, Type, ɵglobal } from '@angular/core';

import { NoopNgxsExecutionStrategy } from './noop-ngxs-execution-strategy';
import { DispatchOutsideZoneNgxsExecutionStrategy } from './dispatch-outside-zone-ngxs-execution-strategy';

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

/**
 * Consumers have the option to utilize the execution strategy provided by
 * `NgxsModule.forRoot({executionStrategy})` or `provideStore([], {executionStrategy})`.
 */
export const CUSTOM_NGXS_EXECUTION_STRATEGY = new InjectionToken<
  Type<NgxsExecutionStrategy> | undefined
>(NG_DEV_MODE ? 'CUSTOM_NGXS_EXECUTION_STRATEGY' : '');

/**
 * The injection token is used internally to resolve an instance of the execution
 * strategy. It checks whether consumers have provided their own `executionStrategy`
 * and also verifies if we are operating in a zone-aware environment.
 */
export const NGXS_EXECUTION_STRATEGY = new InjectionToken<NgxsExecutionStrategy>(
  NG_DEV_MODE ? 'NGXS_EXECUTION_STRATEGY' : '',
  {
    providedIn: 'root',
    factory: () => {
      const injector = inject(INJECTOR);
      const executionStrategy = injector.get(CUSTOM_NGXS_EXECUTION_STRATEGY);
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
