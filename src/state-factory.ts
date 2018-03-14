import { Injector, Injectable, SkipSelf, Optional } from '@angular/core';
import { META_KEY } from './symbols';
import { getTypeFromInstance } from './internals';

@Injectable()
export class StateFactory {
  stores: any[] = [];

  constructor(
    private _injector: Injector,
    @Optional()
    @SkipSelf()
    private _parentFactory: StateFactory
  ) {}

  add(stores: any | any[]): any[] {
    if (!Array.isArray(stores)) {
      stores = [stores];
    }

    const mappedStores = [];
    for (const klass of stores) {
      if (!klass[META_KEY]) {
        throw new Error('States must be decorated with @State() decorator');
      }

      const { actions, name } = klass[META_KEY];
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

  invokeActions(getState, setState, action): any[] {
    const results = [];

    for (const metadata of this.stores) {
      const name = getTypeFromInstance(action);
      const actionMeta = metadata.actions[name];

      if (actionMeta) {
        const stateContext = {
          get state() {
            const state = getState();
            return state[metadata.name];
          },
          setState(val) {
            const state = getState();
            setState({
              ...state,
              [metadata.name]: val
            });
          }
        };

        const result = metadata.instance[actionMeta.fn](stateContext, action);
        if (result) {
          results.push(result);
        }
      }
    }

    return results;
  }
}
