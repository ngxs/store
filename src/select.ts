import { Injectable } from '@angular/core';
import { Ngxs } from './ngxs';
import { fastPropGetter } from './internals';

@Injectable()
export class SelectFactory {
  static store: Ngxs | undefined = undefined;
  constructor(store: Ngxs) {
    SelectFactory.store = store;
  }
}

/**
 * Decorates a member with a select signature
 */
export function Select(selectorOrFeature?, ...paths: string[]) {
  return function(target: any, name: string) {
    const selectorFnName = '__' + name + '__selector';
    let fn;

    if (!selectorOrFeature) {
      // if foo$ => make it just foo
      selectorOrFeature = name.lastIndexOf('$') === name.length - 1 ? name.substring(0, name.length - 1) : name;
    }

    if (typeof selectorOrFeature === 'string') {
      const propsArray = paths.length ? [selectorOrFeature, ...paths] : selectorOrFeature.split('.');
      fn = fastPropGetter(propsArray);
    } else {
      fn = selectorOrFeature;
    }

    const createSelect = () => {
      const store = SelectFactory.store;
      if (!store) {
        throw new Error('SelectFactory not connected to store!');
      }
      return store.select(fn);
    };

    if (target[selectorFnName]) {
      throw new Error('You cannot use @Select decorator and a ' + selectorFnName + ' property.');
    }

    if (delete target[name]) {
      Object.defineProperty(target, selectorFnName, {
        writable: true,
        enumerable: false,
        configurable: true,
      });

      Object.defineProperty(target, name, {
        get: function() {
          return this[selectorFnName] || (this[selectorFnName] = createSelect.apply(this));
        },
        enumerable: true,
        configurable: true,
      });
    }
  };
}
