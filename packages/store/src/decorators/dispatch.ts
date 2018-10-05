import { Injectable, Injector } from '@angular/core';
import { Store } from '../store';

/**
 * Allows the `@Dispatch()` decorator to get access to the DI store.
 * @ignore
 */
@Injectable()
export class DispatchFactory {
  public static injector: Injector | null = null;

  constructor(injector: Injector) {
    DispatchFactory.injector = injector;
  }
}

/**
 * Decorates a property and defines new getter.
 */
export function Dispatch(dispatcher: Function): PropertyDecorator {
  return (target: Function, key: string) => {
    Object.defineProperty(target, key, {
      get: () => {
        const store = DispatchFactory.injector.get<Store>(Store);
        return store.emitter(dispatcher);
      }
    });
  };
}
