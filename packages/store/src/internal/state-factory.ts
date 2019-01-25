import { Injectable, Injector, Optional, SkipSelf } from '@angular/core';
import { forkJoin, from, Observable, of, throwError } from 'rxjs';
import {
  catchError,
  defaultIfEmpty,
  filter,
  map,
  mergeMap,
  shareReplay,
  takeUntil
} from 'rxjs/operators';

import { META_KEY, NgxsConfig, StateClassName, StateName } from '../symbols';
import {
  buildGraph,
  findFullParentPath,
  isObject,
  MappedStore,
  nameToState,
  propGetter,
  StateClass,
  StatesAndDefaults,
  topologicalSort
} from './internals';
import { getActionTypeFromInstance, setValue } from '../utils/utils';
import { ofActionDispatched } from '../operators/of-action';
import { ActionContext, ActionStatus, InternalActions } from '../actions-stream';
import { InternalDispatchedActionResults } from '../internal/dispatcher';
import { StateContextFactory } from '../internal/state-context-factory';
import { StoreValidators } from '../utils/store-validators';

/**
 * State factory class
 * @ignore
 */
@Injectable()
export class StateFactory {
  private _connected = false;
  private _statesNames: Map<StateName, StateClassName> = new Map();

  constructor(
    private _injector: Injector,
    private _config: NgxsConfig,
    @Optional()
    @SkipSelf()
    private _parentFactory: StateFactory,
    private _actions: InternalActions,
    private _actionResults: InternalDispatchedActionResults,
    private _stateContextFactory: StateContextFactory
  ) {}

  private _states: MappedStore[] = [];

  public get states(): MappedStore[] {
    return this._parentFactory ? this._parentFactory.states : this._states;
  }

  public get stateNames(): Map<StateName, StateClassName> {
    return this._parentFactory ? this._parentFactory.stateNames : this._statesNames;
  }

  public set stateNames(names: Map<StateName, StateClassName>) {
    const state: Map<StateName, StateClassName> = this.stateNames;
    for (const [key, value] of names) {
      state.set(key, value);
    }
  }

  /**
   * Add a new state to the global defs.
   */
  add(stateClasses: StateClass[]): MappedStore[] {
    const stateGraph = buildGraph(stateClasses);
    const sortedStates = topologicalSort(stateGraph);
    const depths = findFullParentPath(stateGraph);
    const nameGraph = nameToState(stateClasses);
    const mappedStores: MappedStore[] = [];

    for (const name of sortedStates) {
      const stateClass = nameGraph[name];
      const depth = depths[name];
      const { actions } = stateClass[META_KEY]!;
      let { defaults } = stateClass[META_KEY]!;

      stateClass[META_KEY]!.path = depth;
      stateClass[META_KEY]!.selectFromAppState = propGetter(depth.split('.'), this._config);

      // ensure our store hasn't already been added
      // but dont throw since it could be lazy
      // loaded from different paths
      if (this.stateNames.has(name)) {
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
    }

    this.states.push(...mappedStores);

    return mappedStores;
  }

  /**
   * Add a set of states to the store and return the defaults
   */
  addAndReturnDefaults(stateClasses: StateClass[]): StatesAndDefaults {
    const classes: StateClass[] = stateClasses || [];
    this.stateNames = StoreValidators.validateStateNames(classes);

    const states = this.add(classes);
    const defaults = states.reduce(
      (result: any, meta: MappedStore) => setValue(result, meta.depth, meta.defaults),
      {}
    );
    return { defaults, states };
  }

  /**
   * Bind the actions to the handlers
   */
  connectActionHandlers() {
    if (this._connected) return;
    this._actions
      .pipe(
        filter((ctx: ActionContext) => ctx.status === ActionStatus.Dispatched),
        mergeMap(({ action }) =>
          this.invokeActions(this._actions, action!).pipe(
            map(() => <ActionContext>{ action, status: ActionStatus.Successful }),
            defaultIfEmpty(<ActionContext>{ action, status: ActionStatus.Canceled }),
            catchError(error =>
              of(<ActionContext>{ action, status: ActionStatus.Errored, error })
            )
          )
        )
      )
      .subscribe(ctx => this._actionResults.next(ctx));
    this._connected = true;
  }

  /**
   * Invoke actions on the states.
   */
  invokeActions(actions$: InternalActions, action: any) {
    const results = [];

    for (const metadata of this.states) {
      const type = getActionTypeFromInstance(action)!;
      const actionMetas = metadata.actions[type];

      if (actionMetas) {
        for (const actionMeta of actionMetas) {
          const stateContext = this._stateContextFactory.createStateContext(metadata);
          try {
            let result = metadata.instance[actionMeta.fn](stateContext, action);

            if (result instanceof Promise) {
              result = from(result);
            }

            if (result instanceof Observable) {
              result = result.pipe(
                actionMeta.options.cancelUncompleted
                  ? // todo: ofActionDispatched should be used with action class
                    takeUntil(actions$.pipe(ofActionDispatched(action as any)))
                  : map(r => r)
              ); // map acts like a noop
            } else {
              result = of({}).pipe(shareReplay());
            }

            results.push(result);
          } catch (e) {
            results.push(throwError(e));
          }
        }
      }
    }

    if (!results.length) {
      results.push(of({}));
    }

    return forkJoin(results);
  }
}
