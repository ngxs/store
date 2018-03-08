import { Injector, Injectable, SkipSelf, Optional } from '@angular/core';
import { META_KEY } from './symbols';
import { getTypeFromInstance } from './internals';

@Injectable()
export class StoreFactory {
  stores: any[] = [];

  constructor(
    private _injector: Injector,
    @Optional()
    @SkipSelf()
    private _parentFactory: StoreFactory
  ) {}

  add(stores: any | any[]): any[] {
    if (!Array.isArray(stores)) {
      stores = [stores];
    }

    const mappedStores = [];
    for (const klass of stores) {
      if (!klass[META_KEY]) {
        throw new Error('Stores must be decorated with @Store() decorator');
      }

      const { actions, mutations, name } = klass[META_KEY];
      let { defaults } = klass[META_KEY];

      // ensure our store hasn't already been added
      const has = this.stores.find(s => s.name === name);
      if (has) {
        throw new Error(`Store has already been added ${name}`);
      }

      // create new instance of defaults
      if (Array.isArray(defaults)) {
        defaults = [...defaults];
      } else {
        defaults = { ...defaults };
      }

      const instance = this._injector.get(klass);
      mappedStores.push({
        actions,
        mutations,
        instance,
        defaults,
        name
      });
    }

    const globalStores = this._parentFactory ? this._parentFactory.stores : this.stores;

    globalStores.push(...mappedStores);
    return mappedStores;
  }

  addAndReturnDefaults(stores) {
    return this.add(stores).reduce((result, meta) => {
      result[meta.name] = meta.defaults;
      return result;
    }, {});
  }

  invokeMutations(state, mutation) {
    for (const reducerMeta of this.stores) {
      const name = getTypeFromInstance(mutation);
      const mutationMeta = reducerMeta.mutations[name];

      if (mutationMeta) {
        const local = state[reducerMeta.name];
        let result = reducerMeta.instance[mutationMeta.fn](local, mutation);

        // if no result returned, lets shallow copy the state
        if (!result) {
          if (Array.isArray(local)) {
            result = [...local];
          } else {
            result = { ...local };
          }
        }
        state = {
          ...state,
          [reducerMeta.name]: result
        };
      }
    }

    return state;
  }

  invokeEvents(state, event) {
    const results: any[] = [];

    for (const reducerMeta of this.stores) {
      const name = getTypeFromInstance(event);
      const actionMeta = reducerMeta.actions[name];
      if (actionMeta) {
        const local = state[reducerMeta.name];
        const result = reducerMeta.instance[actionMeta.fn](local, event);
        if (result) {
          results.push(result);
        }
      }
    }

    return results;
  }
}
