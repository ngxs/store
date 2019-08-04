import { Observable } from 'rxjs';

import { SELECT_META_KEY } from '../../symbols';
import { createSelect, createSelector } from './symbols';
import { removeDollarAtTheEnd } from '../../internal/internals';
import { CONFIG_MESSAGES, VALIDATION_CODE } from '../../configs/messages.config';

/**
 * Decorator for selecting a slice of state from the store.
 */
export function Select(selectorOrFeature?: any, ...paths: string[]): PropertyDecorator {
  return function(target: any, key: string | symbol): void {
    if (!Object.isExtensible(target)) {
      throw new Error(CONFIG_MESSAGES[VALIDATION_CODE.SELECT_CLASS_NOT_EXTENSIBLE]());
    }

    const name: string = key.toString();
    const selectorId: unique symbol = Symbol(`${SELECT_META_KEY}__${name}`);
    selectorOrFeature = !selectorOrFeature ? removeDollarAtTheEnd(name) : selectorOrFeature;

    Object.defineProperty(target, selectorId, {
      writable: true,
      enumerable: false,
      configurable: true
    });

    Object.defineProperty(target, name, {
      enumerable: true,
      configurable: true,
      get: function() {
        if (Object.isFrozen(target)) {
          throw new Error(CONFIG_MESSAGES[VALIDATION_CODE.SELECT_NOT_CONNECTED]());
        }

        let stream: Observable<any> | null = this[selectorId];

        if (!stream) {
          stream = this[selectorId] = createSelect.apply(this, [
            createSelector(
              selectorOrFeature,
              paths
            )
          ]);
        }

        return stream!;
      }
    });
  };
}
