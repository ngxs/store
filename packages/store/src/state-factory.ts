import { Injector, Injectable, SkipSelf, Optional } from '@angular/core';
import { Observable, of, forkJoin, from } from 'rxjs';
import { shareReplay, takeUntil, map } from 'rxjs/operators';

import { META_KEY, StateContext, NgxsLifeCycle } from './symbols';
import {
  topologicalSort,
  buildGraph,
  findFullParentPath,
  nameToState,
  isObject,
  ActionHandlerMetaData,
  ObjectKeyMap,
  StateKlass,
  GetStateFn,
  SetStateFn,
  DispatchFn
} from './internals';
import { getActionTypeFromInstance, setValue, getValue } from './utils';
import { ofActionDispatched } from './of-action';
import { Actions } from '@ngxs/store';
import { InternalActions } from '@ngxs/store/src/actions-stream';

interface MappedStore {
  name: string;
  actions: ObjectKeyMap<ActionHandlerMetaData[]>;
  defaults: any;
  instance: any;
  depth: string;
}

/**
 * State factory class
 * @ignore
 */
@Injectable()
export class StateFactory {
  get states(): MappedStore[] {
    return this._parentFactory ? this._parentFactory.states : this._states;
  }

  private _states: MappedStore[] = [];

  constructor(
    private _injector: Injector,
    @Optional()
    @SkipSelf()
    private _parentFactory: StateFactory
  ) {}

  /**
   * Add a new state to the global defs.
   */
  add(oneOrManyStateKalsses: StateKlass | StateKlass[]): MappedStore[] {
    let stateKlasses: StateKlass[];
    if (!Array.isArray(oneOrManyStateKalsses)) {
      stateKlasses = [oneOrManyStateKalsses];
    } else {
      stateKlasses = oneOrManyStateKalsses;
    }

    const stateGraph = buildGraph(stateKlasses);
    const sortedStates = topologicalSort(stateGraph);
    const depths = findFullParentPath(stateGraph);
    const nameGraph = nameToState(stateKlasses);
    const mappedStores: MappedStore[] = [];

    for (const name of sortedStates) {
      const klass = nameGraph[name];

      if (!klass[META_KEY]) {
        throw new Error('States must be decorated with @State() decorator');
      }

      const depth = depths[name];
      const { actions } = klass[META_KEY];
      let { defaults } = klass[META_KEY];

      klass[META_KEY].path = depth;

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

      mappedStores.push(<MappedStore>{
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

  /**
   * Add a set of states to the store and return the defaulsts
   */
  addAndReturnDefaults(stateKlasses: any[]): { defaults: any; states: MappedStore[] } {
    if (stateKlasses) {
      const states = this.add(stateKlasses);
      const defaults = states.reduce((result, meta: MappedStore) => setValue(result, meta.depth, meta.defaults), {});
      return { defaults, states };
    }
  }

  /**
   * Invoke the init function on the states.
   */
  invokeInit(
    getState: GetStateFn<any>,
    setState: SetStateFn<any>,
    dispatch: DispatchFn,
    stateMetadatas: MappedStore[]
  ) {
    for (const metadata of stateMetadatas) {
      const instance: NgxsLifeCycle = metadata.instance;

      if (instance.ngxsOnInit) {
        const stateContext = this.createStateContext(getState, setState, dispatch, metadata);

        instance.ngxsOnInit(stateContext);
      }
    }
  }

  /**
   * Invoke actions on the states.
   */
  invokeActions(
    getState: GetStateFn<any>,
    setState: SetStateFn<any>,
    dispatch: DispatchFn,
    actions$: InternalActions,
    action
  ) {
    const results = [];

    for (const metadata of this.states) {
      const type = getActionTypeFromInstance(action);
      const actionMetas = metadata.actions[type];

      if (actionMetas) {
        for (const actionMeta of actionMetas) {
          const stateContext = this.createStateContext(getState, setState, dispatch, metadata);
          let result = metadata.instance[actionMeta.fn](stateContext, action);

          if (result instanceof Promise) {
            result = from(result);
          }

          if (result instanceof Observable) {
            result = result.pipe(
              actionMeta.options.cancelUncompleted ? takeUntil(actions$.pipe(ofActionDispatched(action))) : map(r => r)
            ); // act like a noop
          } else {
            result = of({}).pipe(shareReplay());
          }

          results.push(result);
        }
      }
    }

    if (!results.length) {
      results.push(of({}));
    }

    return forkJoin(results);
  }

  /**
   * Create the state context
   */
  createStateContext(
    getState: GetStateFn<any>,
    setState: SetStateFn<any>,
    dispatch: DispatchFn,
    metadata: MappedStore
  ): StateContext<any> {
    return {
      getState(): any {
        const state = getState();
        return getValue(state, metadata.depth);
      },
      patchState(val: any): void {
        if (Array.isArray(val)) {
          throw new Error('Patching arrays is not supported.');
        }

        let state = getState();
        const local = this.getState();
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
  }
}
