import { Injector, Injectable } from '@angular/core';
import { META_KEY } from './symbols';
import { materialize } from 'rxjs/operators';

@Injectable()
export class ReducerFactory {
  reducers = [];

  constructor(private _injector: Injector) {}

  add(reducer: any | any[]) {
    if (!Array.isArray(reducer)) {
      reducer = [reducer];
    }

    this.reducers.push(
      ...reducer.map(klass => {
        const instance = this._injector.get(klass, new klass());

        if (!klass[META_KEY]) {
          throw new Error('Stores must be decorated with @Store() decorator');
        }

        const { actions, mutations, initialState, namespace } = klass[META_KEY];
        return {
          actions,
          mutations,
          instance,
          initialState,
          namespace
        };
      })
    );

    return this.reducers;
  }

  invokeMutations(state, action) {
    for (const reducerMeta of this.reducers) {
      const name = action.constructor.name;
      const mutationMeta = reducerMeta.mutations[name];

      if (mutationMeta) {
        const local = state[reducerMeta.namespace];
        let result = reducerMeta.instance[mutationMeta.fn](local, action);

        if (!result) {
          if (Array.isArray(local)) {
            result = [...local];
          } else {
            result = { ...local };
          }
        }
        state = {
          ...state,
          [reducerMeta.namespace]: result
        };
      }
    }
    return state;
  }

  invokeActions(state, action, dispatch) {
    for (const reducerMeta of this.reducers) {
      const name = action.constructor.name;
      const actionMeta = reducerMeta.actions[name];
      if (actionMeta) {
        const local = state[reducerMeta.namespace];
        const result = reducerMeta.instance[actionMeta.fn]({ state: local, dispatch }, action);
        if (result) {
          if (result.subscribe) {
            result.pipe(materialize()).subscribe(res => dispatch(res));
          } else if (result.then) {
            // handle promises
          }
        }
      }
    }
  }
}
