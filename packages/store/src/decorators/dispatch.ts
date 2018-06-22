import { DecoratorFactory } from './decorator-factory';

/**
 * Decorator for dispatching action to the store.
 */

export function Dispatch(): MethodDecorator {
  return function(target: Function, key: string, descriptor: any) {
    if (!target[key]) {
      throw new Error('You cannot use @Dispatch decorator and a ' + key + ' Action.');
    }

    const originalMethod = descriptor.value;
    descriptor.value = function(...args: any[]) {
      const store = DecoratorFactory.store;
      store.dispatch(originalMethod.apply(this, args));
    };

    return descriptor;
  };
}
