import { createSelectObservable, createSelectorFn, PropertyType } from './symbols';

/**
 * Decorator for selecting a slice of state from the store.
 * @deprecated
 */
export function Select<T>(rawSelector?: T, ...paths: string[]): PropertyDecorator {
  return function(target, key): void {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      warnSelectDeprecation();
    }

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

let selectDeprecatedHasBeenWarned = false;
function warnSelectDeprecation(): void {
  if (selectDeprecatedHasBeenWarned) {
    return;
  }

  selectDeprecatedHasBeenWarned = true;

  console.warn(
    `
    The @Select decorator is deprecated due to the following reasons:
    1) lack of type-safety (compared to 'store.select()')
    2) not compatible with server-side rendering because it uses a global 'Store' instance, which might change between renders
    3) not compatible with module federation
    Consider replacing it the with store.select.
    If you're using VSCode you can replace @Select usages with the following RegExp.
    Search: @Select\((.*)\)\n(.*): Observable<(.*)>;$
    Replace: $2 = this.store.select<$3>($1);
    `
  );
}
