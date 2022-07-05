import { createSelectObservable, createSelectorFn, PropertyType } from './symbols';

/**
 * Decorator for selecting a slice of state from the store.
 * @deprecated
 */
export function Select<T>(rawSelector?: T, ...paths: string[]): PropertyDecorator {
  return function(target, key): void {
    console.warn(
      `
      The @Select decorator has been deprecated due to the following reasons:
      1) Lack of type-safety (compare to 'store.select()')
      2) Not compatible with server-side rendering because it uses a global 'Store' instance, which might change between renders
      3) Not compatible with module federation
      Consider replacing it the with store.select.
      `
    );

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
