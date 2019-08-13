import { Observable } from 'rxjs';

import { createSelectObservable, createSelectorFn } from './symbols';
import { StoreValidators } from '../../utils/store-validators';
import { NGXS_DECORATOR } from '../symbols';

/**
 * Decorator for selecting a slice of state from the store.
 */
export function Select(rawSelector?: any, ...paths: string[]): PropertyDecorator {
  return function(target: any, propertyKey: string | symbol): void {
    StoreValidators.checkExtensibleBeforeDecorate(target, NGXS_DECORATOR.SELECT);

    const name: string = propertyKey.toString();
    const selectorId = `__${name}__selector`;
    const selector: any = createSelectorFn(name, rawSelector, paths);

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
          StoreValidators.checkIsFrozenBeforeDecorate(target, NGXS_DECORATOR.SELECT);
          return this[selectorId] || (this[selectorId] = createSelectObservable(selector));
        }
      }
    });
  };
}
