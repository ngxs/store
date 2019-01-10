import { Injector, Injectable, SkipSelf, Optional } from '@angular/core';
import { Observable, of, forkJoin, from, throwError } from 'rxjs';
import {
  shareReplay,
  takeUntil,
  map,
  catchError,
  filter,
  mergeMap,
  defaultIfEmpty
} from 'rxjs/operators';

import { META_KEY, NgxsConfig } from '../symbols';
import {
  topologicalSort,
  buildGraph,
  findFullParentPath,
  nameToState,
  propGetter,
  isObject,
  MappedStore,
  StateClass,
  StatesAndDefaults
} from './internals';
import { getActionTypeFromInstance, setValue } from '../utils/utils';
import { ofActionDispatched } from '../operators/of-action';
import { InternalActions, ActionStatus, ActionContext } from '../actions-stream';
import { InternalDispatchedActionResults } from '../internal/dispatcher';
import { StateContextFactory } from '../internal/state-context-factory';

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
    private _config: NgxsConfig,
    @Optional()
    @SkipSelf()
    private _parentFactory: StateFactory,
    private _actions: InternalActions,
    private _actionResults: InternalDispatchedActionResults,
    private _stateContextFactory: StateContextFactory
  ) {}

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
      const { actions } = stateClass[META_KEY]!;
      let { defaults } = stateClass[META_KEY]!;

      stateClass[META_KEY]!.path = depth;
      stateClass[META_KEY]!.selectFromAppState = propGetter(depth.split('.'), this._config);

      // ensure our store hasn't already been added
      // but dont throw since it could be lazy
      // loaded from different paths
      const has = this.states.find(s => s.name === name);
      if (!has) {
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
  addAndReturnDefaults(stateClasses: any[]): StatesAndDefaults | undefined {
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
