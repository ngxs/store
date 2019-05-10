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

import { META_KEY, NgxsConfig } from '../symbols';
import {
  buildGraph,
  findFullParentPath,
  isObject,
  MappedStore,
  MetaDataModel,
  nameToState,
  ObjectKeyMap,
  propGetter,
  StateClass,
  StateKeyGraph,
  StatesAndDefaults,
  StatesByName,
  topologicalSort,
  SharedSelectorOptions
} from './internals';
import { getActionTypeFromInstance, getValue, setValue } from '../utils/utils';
import { ofActionDispatched } from '../operators/of-action';
import { ActionContext, ActionStatus, InternalActions } from '../actions-stream';
import { InternalDispatchedActionResults } from '../internal/dispatcher';
import { StateContextFactory } from '../internal/state-context-factory';
import { StoreValidators } from '../utils/store-validators';
import { InternalStateOperations } from '../internal/state-operations';

/**
 * State factory class
 * @ignore
 */
@Injectable()
export class StateFactory {
  private _connected = false;
  private _states: MappedStore[] = [];
  private _statesByName: StatesByName = {};

  constructor(
    private _injector: Injector,
    private _config: NgxsConfig,
    @Optional()
    @SkipSelf()
    private _parentFactory: StateFactory,
    private _actions: InternalActions,
    private _actionResults: InternalDispatchedActionResults,
    private _stateContextFactory: StateContextFactory,
    private _internalStateOperations: InternalStateOperations
  ) {}

  public get states(): MappedStore[] {
    return this._parentFactory ? this._parentFactory.states : this._states;
  }

  public get statesByName(): StatesByName {
    return this._parentFactory ? this._parentFactory.statesByName : this._statesByName;
  }

  private get stateTreeRef(): ObjectKeyMap<any> {
    return this._internalStateOperations.getRootStateOperations().getState();
  }

  private static cloneDefaults(defaults: any): any {
    let value = {};

    if (Array.isArray(defaults)) {
      value = [...defaults];
    } else if (isObject(defaults)) {
      value = { ...defaults };
    } else if (defaults === undefined) {
      value = {};
    } else {
      value = defaults;
    }

    return value;
  }

  private static checkStatesAreValid(stateClasses: StateClass[]): void {
    stateClasses.forEach(StoreValidators.getValidStateMeta);
  }

  /**
   * Add a new state to the global defs.
   */
  add(stateClasses: StateClass[]): MappedStore[] {
    StateFactory.checkStatesAreValid(stateClasses);
    const { newStates } = this.addToStatesMap(stateClasses);
    if (!newStates.length) return [];

    const stateGraph: StateKeyGraph = buildGraph(newStates);
    const sortedStates: string[] = topologicalSort(stateGraph);
    const depths: ObjectKeyMap<string> = findFullParentPath(stateGraph);
    const nameGraph: ObjectKeyMap<StateClass> = nameToState(newStates);
    const bootstrappedStores: MappedStore[] = [];

    for (const name of sortedStates) {
      const stateClass: StateClass = nameGraph[name];
      const depth: string = depths[name];
      const meta: MetaDataModel = stateClass[META_KEY]!;

      this.addRuntimeInfoToMeta(meta, depth);

      const stateMap: MappedStore = {
        name,
        depth,
        actions: meta.actions,
        instance: this._injector.get(stateClass),
        defaults: StateFactory.cloneDefaults(meta.defaults)
      };

      // ensure our store hasn't already been added
      // but don't throw since it could be lazy
      // loaded from different paths
      if (!this.hasBeenMountedAndBootstrapped(name, depth)) {
        bootstrappedStores.push(stateMap);
      }

      this.states.push(stateMap);
    }

    return bootstrappedStores;
  }

  /**
   * Add a set of states to the store and return the defaults
   */
  addAndReturnDefaults(stateClasses: StateClass[]): StatesAndDefaults {
    const classes: StateClass[] = stateClasses || [];

    const states: MappedStore[] = this.add(classes);
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

  private addToStatesMap(stateClasses: StateClass[]): { newStates: StateClass[] } {
    const newStates: StateClass[] = [];
    const statesMap: StatesByName = this.statesByName;

    for (const stateClass of stateClasses) {
      const stateName: string = StoreValidators.checkStateNameIsUnique(stateClass, statesMap);
      const unmountedState: boolean = !statesMap[stateName];
      if (unmountedState) {
        newStates.push(stateClass);
        statesMap[stateName] = stateClass;
      }
    }

    return { newStates };
  }

  private addRuntimeInfoToMeta(meta: MetaDataModel, depth: string): void {
    meta.path = depth;
    meta.selectFromAppState = propGetter(depth.split('.'), this._config);
  }

  /**
   * @description
   * the method checks if the state has already been added to the tree
   * and completed the life cycle
   * @param name
   * @param path
   */
  private hasBeenMountedAndBootstrapped(name: string, path: string): boolean {
    const valueIsBootstrapped: boolean = getValue(this.stateTreeRef, path) !== undefined;
    return this.statesByName[name] && valueIsBootstrapped;
  }
}
