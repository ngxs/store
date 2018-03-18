import { Injector, Injectable, SkipSelf, Optional } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { META_KEY } from './symbols';
import {
  getTypeFromInstance,
  topologicalSort,
  buildGraph,
  findFullParentPath,
  nameToState,
  setValue,
  getValue,
  MetaDataModel
} from './internals';

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
      } else {
        defaults = { ...defaults };
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
      const name = getTypeFromInstance(action);
      const actionMeta = metadata.actions[name];

      if (actionMeta) {
        const stateContext = {
          get state(): any {
            const state = getState();
            return getValue(state, metadata.depth);
          },
          setState(val: any): void {
            let state = { ...getState() };
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

    return results;
  }
}
