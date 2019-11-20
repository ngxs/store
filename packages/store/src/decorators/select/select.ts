import {
  ComponentClass,
  createSelectObservable,
  createSelectorFn,
  PropertyType,
  SelectType
} from './symbols';

/**
 * Decorator for selecting a slice of state from the store.
 */
export function Select<T>(rawSelector?: T, ...paths: string[]): SelectType<T> {
  return function<
    U extends ComponentClass<any> & Record<K, PropertyType<T>>,
    K extends string
  >(target: U, key: K): void {
    const name: string = key.toString();
    const selectorId = `__${name}__selector`;
    const selector = createSelectorFn(name, rawSelector, paths);

    Object.defineProperties(target, {
      [selectorId]: {
        writable: true,
        enumerable: false,
        configurable: true
      },
      [name]: {
        enumerable: true,
        configurable: true,
        get(): PropertyType<T> {
          return this[selectorId] || (this[selectorId] = createSelectObservable(selector));
        }
      }
    });
  };
}
