import { APP_BOOTSTRAP_LISTENER, Provider, inject } from '@angular/core';
import { ɵStateClass, ɵNGXS_APP_BOOTSTRAP_STATE } from '@ngxs/store/internals';

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
        const bootstrapState = inject(ɵNGXS_APP_BOOTSTRAP_STATE);
        return () => bootstrapState.set(true);
      },
      multi: true
    },
    {
      provide: NGXS_OPTIONS,
      useValue: options
    }
  ];
}
