import { memoize } from './memoize';

export function Selector() {
  return (target: any, key: string, descriptor: PropertyDescriptor): void => {
    /*
    const prevFunction = descriptor.value;
    let memoized;
    descriptor.value = () => {
      if (memoized) {
        return memoize();
      } else {
        const result = prevFunction([]);
        memoized = (memoize)
      }
      return prevFunction;
    };
    */
  };
}
