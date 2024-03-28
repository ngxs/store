import { Observable } from 'rxjs';

import { dispatch } from './dispatch';
import { RequireAtLeastOneProperty } from './types';

import { ActionDef } from '../actions/symbols';

export type ActionMap = Record<string, ActionDef<any>>;

export function createDispatchMap<T extends ActionMap>(
  actionMap: RequireAtLeastOneProperty<T>
) {
  return Object.entries(actionMap).reduce((accumulator, [key, ActionType]) => {
    Object.defineProperty(accumulator, key, {
      value: dispatch(ActionType)
    });
    return accumulator;
  }, {}) as {
    // This is inlined to enhance developer experience.
    // If we were to switch to another type, such as
    // `type ActionMapReturnType<T extends ActionMap> = { ... }`, code editors
    // would display the return type simply as `ActionMapReturnType`, rather
    // than presenting it as an object with properties that correspond to
    // functions returning observables.
    readonly [K in keyof T]: (...args: ConstructorParameters<T[K]>) => Observable<void>;
  };
}
