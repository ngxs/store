import { fastPropGetter } from '../internal/internals';
import { META_KEY } from '../symbols';
import { DecoratorFactory } from './decorator-factory';

/**
 * Decorator for selecting a slice of state from the store.
 */
export function Select(selectorOrFeature?, ...paths: string[]) {
  return function(target: any, name: string) {
    const selectorFnName = '__' + name + '__selector';

    if (!selectorOrFeature) {
      // if foo$ => make it just foo
      selectorOrFeature = name.lastIndexOf('$') === name.length - 1 ? name.substring(0, name.length - 1) : name;
    }

    const createSelect = fn => {
      const store = DecoratorFactory.store;

      if (!store) {
        throw new Error('DecoratorFactory not connected to store!');
      }

      return store.select(fn);
    };

    const createSelector = () => {
      if (typeof selectorOrFeature === 'string') {
        const propsArray = paths.length ? [selectorOrFeature, ...paths] : selectorOrFeature.split('.');

        return fastPropGetter(propsArray);
      } else if (selectorOrFeature[META_KEY] && selectorOrFeature[META_KEY].path) {
        return fastPropGetter(selectorOrFeature[META_KEY].path.split('.'));
      } else {
        return selectorOrFeature;
      }
    };

    if (target[selectorFnName]) {
      throw new Error('You cannot use @Select decorator and a ' + selectorFnName + ' property.');
    }

    if (delete target[name]) {
      Object.defineProperty(target, selectorFnName, {
        writable: true,
        enumerable: false,
        configurable: true
      });

      Object.defineProperty(target, name, {
        get: function() {
          return this[selectorFnName] || (this[selectorFnName] = createSelect.apply(this, [createSelector()]));
        },
        enumerable: true,
        configurable: true
      });
    }
  };
}
