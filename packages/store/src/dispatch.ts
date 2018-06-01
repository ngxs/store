import { Injectable } from '@angular/core';

import { Store } from './store';

/**
 * Allows the dispatch decorator to get access to the DI store.
 * @ignore
 */
@Injectable()
export class DispatchFactory {
  static store: Store | undefined = undefined;

  constructor(store: Store) {
    DispatchFactory.store = store;
  }
}

/**
 * Decorator for dispatching action to the store.
 */
export function Dispatch(Action): MethodDecorator {
  return function(target: Function, key: string, descriptor: any) {
    if (!target[key]) {
      throw new Error('You cannot use @Dispatch decorator and a ' + key + ' property.');
    }

    if (delete target[key]) {
      const originalMethod = descriptor.value;

      descriptor.value = function(...args: any[]) {
        const val: any = args[0];
        const store = DispatchFactory.store;

        const action = new Action(val);
        store.dispatch(action);

        return originalMethod.apply(this, args);
      };

      return descriptor;
    }
  };
}
