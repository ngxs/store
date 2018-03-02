import { Injector, Injectable } from '@angular/core';
import { META_KEY } from './symbols';
import { materialize } from 'rxjs/operators';
import { EventStream } from './event-stream';

@Injectable()
export class StoreFactory {
  stores: any[] = [];

  constructor(private _eventStream: EventStream, private _injector: Injector) {}

  add(store: any | any[]) {
    if (!Array.isArray(store)) {
      store = [store];
    }

    this.stores.push(
      ...store.map(klass => {
        const instance = this._injector.get(klass, new klass());

        if (!klass[META_KEY]) {
          throw new Error('Stores must be decorated with @Store() decorator');
        }

        const { actions, mutations, defaults, name } = klass[META_KEY];
        return {
          actions,
          mutations,
          instance,
          defaults,
          name
        };
      })
    );

    return this.stores;
  }

  invokeMutations(state, mutation) {
    for (const reducerMeta of this.stores) {
      const name = mutation.constructor.type || mutation.constructor.name;
      const mutationMeta = reducerMeta.mutations[name];

      if (mutationMeta) {
        const local = state[reducerMeta.name];
        let result = reducerMeta.instance[mutationMeta.fn](local, mutation);

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

  invokeActions(state, action) {
    const results = [];
    for (const reducerMeta of this.stores) {
      const name = action.constructor.type || action.constructor.name;
      const actionMeta = reducerMeta.actions[name];
      if (actionMeta) {
        const local = state[reducerMeta.name];
        const result = reducerMeta.instance[actionMeta.fn](local, action);
        if (result) {
          results.push(result);
        }
      }
    }
    return results;
  }
}
