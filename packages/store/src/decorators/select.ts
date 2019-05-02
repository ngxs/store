import { Injectable } from '@angular/core';

import { Store } from '../store';
import { propGetter, removeDollarAtTheEnd } from '../internal/internals';
import { META_KEY, NgxsConfig } from '../symbols';

/**
 * Allows the select decorator to get access to the DI store.
 * @ignore
 */
@Injectable()
export class SelectFactory {
  static store: Store | undefined = undefined;
  static config: NgxsConfig | undefined = undefined;
  constructor(store: Store, config: NgxsConfig) {
    SelectFactory.store = store;
    SelectFactory.config = config;
  }
}

/**
 * Decorator for selecting a slice of state from the store.
 */
export function Select(selectorOrFeature?: any, ...paths: string[]) {
  return function(target: any, name: string) {
    const selectorFnName = '__' + name + '__selector';

    if (!selectorOrFeature) {
      selectorOrFeature = removeDollarAtTheEnd(name);
    }

    const createSelect = (fn: any) => {
      const store = SelectFactory.store;

      if (!store) {
        throw new Error('SelectFactory not connected to store!');
      }

      return store.select(fn);
    };

    const createSelector = () => {
      const config = SelectFactory.config;
      if (typeof selectorOrFeature === 'string') {
        const propsArray = paths.length
          ? [selectorOrFeature, ...paths]
          : selectorOrFeature.split('.');

        return propGetter(propsArray, config!);
      } else if (selectorOrFeature[META_KEY] && selectorOrFeature[META_KEY].path) {
        return propGetter(selectorOrFeature[META_KEY].path.split('.'), config!);
      } else {
        return selectorOrFeature;
      }
    };

    if (target[selectorFnName]) {
      throw new Error(
        'You cannot use @Select decorator and a ' + selectorFnName + ' property.'
      );
    }

    if (delete target[name]) {
      Object.defineProperty(target, selectorFnName, {
        writable: true,
        enumerable: false,
        configurable: true
      });

      Object.defineProperty(target, name, {
        get: function() {
          return (
            this[selectorFnName] ||
            (this[selectorFnName] = createSelect.apply(this, [createSelector()]))
          );
        },
        enumerable: true,
        configurable: true
      });
    }
  };
}
