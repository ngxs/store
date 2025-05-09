import { APP_BOOTSTRAP_LISTENER, Provider, inject } from '@angular/core';
import { ɵStateClass, ɵNgxsAppBootstrappedState } from '@ngxs/store/internals';

import { CUSTOM_NGXS_EXECUTION_STRATEGY } from '../execution/symbols';
import { NgxsModuleOptions, ROOT_STATE_TOKEN, NGXS_OPTIONS } from '../symbols';

/**
 * This function provides the required providers when invoking `NgxsModule.forRoot`
 * or `provideStore`. It is shared between the NgModule and standalone APIs.
 */
export function getRootProviders(
  states: ɵStateClass[],
  options: NgxsModuleOptions
): Provider[] {
  return [
    ...states,
    {
      provide: ROOT_STATE_TOKEN,
      useValue: states
    },
    {
      provide: APP_BOOTSTRAP_LISTENER,
      useFactory: () => {
        const appBootstrappedState = inject(ɵNgxsAppBootstrappedState);
        return () => appBootstrappedState.bootstrap();
      },
      multi: true
    },
    {
      provide: NGXS_OPTIONS,
      useValue: options
    },
    {
      provide: CUSTOM_NGXS_EXECUTION_STRATEGY,
      useValue: options.executionStrategy
    }
  ];
}
