import { Observable } from 'rxjs';
import { createSelectObservable, createSelectorFn } from './symbols';

/**
 * Decorator for selecting a slice of state from the store.
 */
export function Select(rawSelector?: any, ...paths: string[]): PropertyDecorator {
  return function(target: any, propertyKey: string | symbol): void {
    const name: string = propertyKey.toString();
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
        get(): Observable<any> {
          return this[selectorId] || (this[selectorId] = createSelectObservable(selector));
        }
      }
    });
  };
}
