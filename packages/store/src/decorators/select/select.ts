import { Observable } from 'rxjs';

import { SELECT_META_KEY } from '../../symbols';
import { SelectFactory } from './select-factory';
import { CONFIG_MESSAGES, VALIDATION_CODE } from '../../configs/messages.config';

/**
 * Decorator for selecting a slice of state from the store.
 */
export function Select(rawSelector?: any, ...paths: string[]): PropertyDecorator {
  return function(target: any, key: string | symbol): void {
    if (!Object.isExtensible(target)) {
      throw new Error(CONFIG_MESSAGES[VALIDATION_CODE.SELECT_CLASS_NOT_EXTENSIBLE]());
    }

    const name: string = key.toString();
    const selectorId: unique symbol = Symbol(`${SELECT_META_KEY}__${name}`);
    const selector: any = SelectFactory.unwrapSelector(name, rawSelector, paths);

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
          if (Object.isFrozen(target)) {
            throw new Error(CONFIG_MESSAGES[VALIDATION_CODE.SELECT_NOT_CONNECTED]());
          }

          return (
            this[selectorId] || (this[selectorId] = SelectFactory.selectBySelector(selector))
          );
        }
      }
    });
  };
}
