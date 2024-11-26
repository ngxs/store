import { InjectionToken, inject, INJECTOR, Type, NgZone } from '@angular/core';

import { NoopNgxsExecutionStrategy } from './noop-ngxs-execution-strategy';
import { DispatchOutsideZoneNgxsExecutionStrategy } from './dispatch-outside-zone-ngxs-execution-strategy';

/**
 * Consumers have the option to utilize the execution strategy provided by
 * `NgxsModule.forRoot({executionStrategy})` or `provideStore([], {executionStrategy})`.
 */
export const CUSTOM_NGXS_EXECUTION_STRATEGY = new InjectionToken<
  Type<NgxsExecutionStrategy> | undefined
>(typeof ngDevMode !== 'undefined' && ngDevMode ? 'CUSTOM_NGXS_EXECUTION_STRATEGY' : '');

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
      const ngZone = inject(NgZone);
      const injector = inject(INJECTOR);
      const executionStrategy = injector.get(CUSTOM_NGXS_EXECUTION_STRATEGY);
      const isNgZoneEnabled = ngZone instanceof NgZone;
      return executionStrategy
        ? injector.get(executionStrategy)
        : injector.get(
            isNgZoneEnabled
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
