import { inject } from '@angular/core';
import { ActionDef, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { RequireAtLeastOneProperty } from './types';

export type ActionMap = Record<string, ActionDef>;

export function produceActions<T extends ActionMap>(actionMap: RequireAtLeastOneProperty<T>) {
  const store = inject(Store);

  return Object.fromEntries(
    Object.entries(actionMap).map(([key, actionType]) => [key, createDispatchFn(actionType)])
  ) as unknown as {
    // This is inlined to enhance developer experience.
    // If we were to switch to another type, such as
    // `type ActionMapReturnType<T extends ActionMap> = { ... }`, code editors
    // would display the return type simply as `ActionMapReturnType`, rather
    // than presenting it as an object with properties that correspond to
    // functions returning observables.
    [K in keyof T]: (...args: ConstructorParameters<T[K]>) => Observable<void>;
  };

  function createDispatchFn(actionType: ActionDef) {
    return (...args: any[]) => store.dispatch(new actionType(...args));
  }
}
