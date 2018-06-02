import { DecoratorFactory } from './decorator-factory';

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
        const store = DecoratorFactory.store;

        const action = new Action(val);
        store.dispatch(action);

        return originalMethod.apply(this, args);
      };

      return descriptor;
    }
  };
}
