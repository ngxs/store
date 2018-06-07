import { Selector } from './selector';

export function SelectorCreator(selectors?: any[]) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    if (descriptor.value !== null) {
      return {
        configurable: true,
        get() {
          return function factory(...args) {
            const value = descriptor.value(...args);
            return Selector(selectors)(target, key, { ...descriptor, value }).get();
          };
        }
      };
    } else {
      throw new Error('SelectorCreators only work on methods');
    }
  };
}
