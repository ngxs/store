import { Injector, Injectable, SkipSelf, Optional } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { META_KEY } from './symbols';
import { topologicalSort, buildGraph, findFullParentPath, nameToState, MetaDataModel, isObject } from './internals';

import { getActionTypeFromInstance, setValue, getValue } from './utils';

@Injectable()
export class StateFactory {
  get states() {
    return this._parentFactory ? this._parentFactory.states : this._states;
  }
  private _states = [];

  constructor(
    private _injector: Injector,
    @Optional()
    @SkipSelf()
    private _parentFactory: StateFactory
  ) {}

  add(states: any | any[]): any[] {
    if (!Array.isArray(states)) {
      states = [states];
    }

    const stateGraph = buildGraph(states);
    const sortedStates = topologicalSort(stateGraph);
    const depths = findFullParentPath(stateGraph);
    const nameGraph = nameToState(states);
    const mappedStores = [];

    for (const name of sortedStates) {
      const klass = nameGraph[name];

      if (!klass[META_KEY]) {
        throw new Error('States must be decorated with @State() decorator');
      }

      const depth = depths[name];
      const { actions } = klass[META_KEY] as MetaDataModel;
      let { defaults } = klass[META_KEY] as MetaDataModel;

      (klass[META_KEY] as MetaDataModel).path = depth;

      // ensure our store hasn't already been added
      const has = this.states.find(s => s.name === name);

      if (has) {
        throw new Error(`Store has already been added: ${name}`);
      }

      // create new instance of defaults
      if (Array.isArray(defaults)) {
        defaults = [...defaults];
      } else if (isObject(defaults)) {
        defaults = { ...defaults };
      } else if (defaults === undefined) {
        defaults = {};
      }

      const instance = this._injector.get(klass);

      mappedStores.push({
        actions,
        instance,
        defaults,
        name,
        depth
      });
    }

    this.states.push(...mappedStores);

    return mappedStores;
  }

  addAndReturnDefaults(stores: any[]): any {
    return this.add(stores).reduce((result, meta) => setValue(result, meta.depth, meta.defaults), {});
  }

  invokeActions(getState, setState, dispatch, action): any[] {
    const results = [];

    for (const metadata of this.states) {
      const name = getActionTypeFromInstance(action);
      const actionMetas = metadata.actions[name];

      if (actionMetas) {
        for (const actionMeta of actionMetas) {
          const stateContext = {
            getState(): any {
              const state = getState();
              return getValue(state, metadata.depth);
            },
            patchState(val: any): void {
              if (Array.isArray(val)) {
                throw new Error('Patching arrays is not supported.');
              }

              let state = getState();
              const local = getValue(state, metadata.depth);
              for (const k in val) {
                local[k] = val[k];
              }
              state = setValue(state, metadata.depth, { ...local });
              setState(state);
              return state;
            },
            setState(val: any): any {
              let state = getState();
              state = setValue(state, metadata.depth, val);
              setState(state);
              return state;
            },
            dispatch(actions: any | any[]): Observable<any> {
              return dispatch(actions);
            }
          };

          const result = metadata.instance[actionMeta.fn](stateContext, action);
          if (result) {
            results.push(result);
          }
        }
      }
    }

    return results;
  }
}
