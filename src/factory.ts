import { Injector, Injectable } from '@angular/core';
import { META_KEY } from './symbols';
import { getTypeFromInstance } from './internals';

@Injectable()
export class StoreFactory {
  stores: any[] = [];

  constructor(private _injector: Injector) {}

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

    this.stores.push(...mappedStores);
    return mappedStores;
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
