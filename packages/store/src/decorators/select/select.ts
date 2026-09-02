import { createSelectObservable, createSelectorFn, PropertyType } from './symbols';

/**
 * Decorator for selecting a slice of state from the store.
 *
 * It doesn't work on its own anymore - opt in with
 * `withNgxsSelectDecoratorSupport()` in `provideStore(...)`, or
 * `NgxsSelectDecoratorSupportModule.forRoot()` next to `NgxsModule.forRoot(...)`:
 *
 * ```ts
 * provideStore([CountriesState], withNgxsSelectDecoratorSupport());
 * ```
 *
 * @deprecated Use `store.select()`, the functional `select()`, or
 * `store.selectSignal()` instead:
 * https://ngxs.io/deprecations/select-decorator-deprecation
 */
export function Select<T>(rawSelector?: T, ...paths: string[]): PropertyDecorator {
  return function (target, key): void {
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
