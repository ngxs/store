import { Injector, Injectable, SkipSelf, Optional } from '@angular/core';
import { Observable, of, forkJoin, from } from 'rxjs';
import { shareReplay, takeUntil, map, catchError, filter, mergeMap, defaultIfEmpty } from 'rxjs/operators';

import { META_KEY, StateContext, NgxsLifeCycle } from './symbols';
import {
  topologicalSort,
  buildGraph,
  findFullParentPath,
  nameToState,
  isObject,
  StateClass,
  InternalStateOperations,
  MappedStore
} from './internals';
import { getActionTypeFromInstance, setValue, getValue } from './utils';
import { ofActionDispatched } from './of-action';
import { InternalActions, ActionStatus, ActionContext } from './actions-stream';
import { InternalDispatchedActionResults, InternalDispatcher } from './dispatcher';
import { StateStream } from './state-stream';

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
  private _connected = false;

  constructor(
    private _injector: Injector,
    @Optional()
    @SkipSelf()
    private _parentFactory: StateFactory,
    private _actions: InternalActions,
    private _actionResults: InternalDispatchedActionResults,
    private _stateStream: StateStream,
    private _dispatcher: InternalDispatcher
  ) {}

  private get rootStateOperations(): InternalStateOperations<any> {
    return {
      getState: () => this._stateStream.getValue(),
      setState: newState => this._stateStream.next(newState),
      dispatch: actions => this._dispatcher.dispatch(actions)
    };
  }

  /**
   * Add a new state to the global defs.
   */
  add(oneOrManyStateClasses: StateClass | StateClass[]): MappedStore[] {
    let stateClasses: StateClass[];
    if (!Array.isArray(oneOrManyStateClasses)) {
      stateClasses = [oneOrManyStateClasses];
    } else {
      stateClasses = oneOrManyStateClasses;
    }

    const stateGraph = buildGraph(stateClasses);
    const sortedStates = topologicalSort(stateGraph);
    const depths = findFullParentPath(stateGraph);
    const nameGraph = nameToState(stateClasses);
    const mappedStores: MappedStore[] = [];

    for (const name of sortedStates) {
      const stateClass = nameGraph[name];

      if (!stateClass[META_KEY]) {
        throw new Error('States must be decorated with @State() decorator');
      }

      const depth = depths[name];
      const { actions } = stateClass[META_KEY];
      let { defaults } = stateClass[META_KEY];

      stateClass[META_KEY].path = depth;

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

      const instance = this._injector.get(stateClass);

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

  /**
   * Add a set of states to the store and return the defaulsts
   */
  addAndReturnDefaults(stateClasses: any[]): { defaults: any; states: MappedStore[] } {
    if (stateClasses) {
      const states = this.add(stateClasses);
      const defaults = states.reduce(
        (result: any, meta: MappedStore) => setValue(result, meta.depth, meta.defaults),
        {}
      );
      return { defaults, states };
    }
  }

  /**
   * Bind the actions to the handlers
   */
  connectActionHandlers() {
    if (this._connected) return;
    this._actions
      .pipe(
        filter((ctx: ActionContext) => ctx.status === ActionStatus.Dispatched),
        mergeMap(({ action }) => {
          return this.invokeActions(this._actions, action).pipe(
            map(() => {
              return <ActionContext>{ action, status: ActionStatus.Completed };
            }),
            defaultIfEmpty(<ActionContext>{ action, status: ActionStatus.Canceled }),
            catchError(err => {
              return of(<ActionContext>{ action, status: ActionStatus.Errored });
            })
          );
        })
      )
      .subscribe(ctx => this._actionResults.next(ctx));
    this._connected = true;
  }

  /**
   * Invoke the init function on the states.
   */
  invokeInit(stateMetadatas: MappedStore[]) {
    for (const metadata of stateMetadatas) {
      const instance: NgxsLifeCycle = metadata.instance;

      if (instance.ngxsOnInit) {
        const stateContext = this.createStateContext(metadata);

        instance.ngxsOnInit(stateContext);
      }
    }
  }

  /**
   * Invoke actions on the states.
   */
  invokeActions(actions$: InternalActions, action) {
    const results = [];

    for (const metadata of this.states) {
      const type = getActionTypeFromInstance(action);
      const actionMetas = metadata.actions[type];

      if (actionMetas) {
        for (const actionMeta of actionMetas) {
          const stateContext = this.createStateContext(metadata);
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
  createStateContext(metadata: MappedStore): StateContext<any> {
    const root = this.rootStateOperations;
    return {
      getState(): any {
        const state = root.getState();
        return getValue(state, metadata.depth);
      },
      patchState(val: any): void {
        if (Array.isArray(val)) {
          throw new Error('Patching arrays is not supported.');
        }

        let state = root.getState();
        const local = getValue(state, metadata.depth);
        for (const k in val) {
          local[k] = val[k];
        }
        state = setValue(state, metadata.depth, { ...local });
        root.setState(state);
        return state;
      },
      setState(val: any): any {
        let state = root.getState();
        state = setValue(state, metadata.depth, val);
        root.setState(state);
        return state;
      },
      dispatch(actions: any | any[]): Observable<any> {
        return root.dispatch(actions);
      }
    };
  }
}
