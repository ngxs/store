import {
  Injectable,
  Injector,
  Optional,
  SkipSelf,
  Inject,
  OnDestroy,
  ɵisPromise
} from '@angular/core';
import {
  forkJoin,
  from,
  Observable,
  of,
  throwError,
  Subscription,
  Subject,
  isObservable
} from 'rxjs';
import {
  catchError,
  defaultIfEmpty,
  filter,
  map,
  mergeMap,
  shareReplay,
  takeUntil
} from 'rxjs/operators';
import { INITIAL_STATE_TOKEN, PlainObjectOf, memoize, ɵMETA_KEY } from '@ngxs/store/internals';

import { NgxsConfig } from '../symbols';
import {
  buildGraph,
  findFullParentPath,
  isObject,
  MappedStore,
  MetaDataModel,
  nameToState,
  propGetter,
  StateClassInternal,
  StateKeyGraph,
  StatesAndDefaults,
  StatesByName,
  topologicalSort,
  RuntimeSelectorContext,
  SharedSelectorOptions,
  getStoreMetadata
} from './internals';
import { getActionTypeFromInstance, getValue, setValue } from '../utils/utils';
import { ofActionDispatched } from '../operators/of-action';
import { ActionContext, ActionStatus, InternalActions } from '../actions-stream';
import { InternalDispatchedActionResults } from '../internal/dispatcher';
import { StateContextFactory } from '../internal/state-context-factory';
import { ensureStateNameIsUnique, ensureStatesAreDecorated } from '../utils/store-validators';
import { ensureStateClassIsInjectable } from '../ivy/ivy-enabled-in-dev-mode';
import { NgxsUnhandledActionsLogger } from '../dev-features/ngxs-unhandled-actions-logger';

const NG_DEV_MODE = typeof ngDevMode === 'undefined' || ngDevMode;

/**
 * The `StateFactory` class adds root and feature states to the graph.
 * This extracts state names from state classes, checks if they already
 * exist in the global graph, throws errors if their names are invalid, etc.
 * See its constructor, state factories inject state factories that are
 * parent-level providers. This is required to get feature states from the
 * injector on the same level.
 *
 * The `NgxsModule.forFeature(...)` returns `providers: [StateFactory, ...states]`.
 * The `StateFactory` is initialized on the feature level and goes through `...states`
 * to get them from the injector through `injector.get(state)`.
 * @ignore
 */
@Injectable()
export class StateFactory implements OnDestroy {
  private _actionsSubscription: Subscription | null = null;

  constructor(
    private _injector: Injector,
    private _config: NgxsConfig,
    @Optional()
    @SkipSelf()
    private _parentFactory: StateFactory,
    private _actions: InternalActions,
    private _actionResults: InternalDispatchedActionResults,
    private _stateContextFactory: StateContextFactory,
    @Optional()
    @Inject(INITIAL_STATE_TOKEN)
    private _initialState: any
  ) {}

  private _states: MappedStore[] = [];

  get states(): MappedStore[] {
    return this._parentFactory ? this._parentFactory.states : this._states;
  }

  private _statesByName: StatesByName = {};

  get statesByName(): StatesByName {
    return this._parentFactory ? this._parentFactory.statesByName : this._statesByName;
  }

  private _statePaths: PlainObjectOf<string> = {};

  private get statePaths(): PlainObjectOf<string> {
    return this._parentFactory ? this._parentFactory.statePaths : this._statePaths;
  }

  getRuntimeSelectorContext = memoize(() => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const stateFactory = this;

    function resolveGetter(key: string) {
      const path = stateFactory.statePaths[key];
      return path ? propGetter(path.split('.'), stateFactory._config) : null;
    }

    const context: RuntimeSelectorContext = this._parentFactory
      ? this._parentFactory.getRuntimeSelectorContext()
      : {
          getStateGetter(key: string) {
            // Use `@__INLINE__` annotation to forcely inline `resolveGetter`.
            // This is a Terser annotation, which will function only in the production mode.
            let getter = /*@__INLINE__*/ resolveGetter(key);
            if (getter) {
              return getter;
            }
            return (...args) => {
              // Late loaded getter
              if (!getter) {
                getter = /*@__INLINE__*/ resolveGetter(key);
              }
              return getter ? getter(...args) : undefined;
            };
          },
          getSelectorOptions(localOptions?: SharedSelectorOptions) {
            const globalSelectorOptions = stateFactory._config.selectorOptions;
            return {
              ...globalSelectorOptions,
              ...(localOptions || {})
            };
          }
        };
    return context;
  });

  private static _cloneDefaults(defaults: any): any {
    let value = defaults;

    if (Array.isArray(defaults)) {
      value = defaults.slice();
    } else if (isObject(defaults)) {
      value = { ...defaults };
    } else if (defaults === undefined) {
      value = {};
    }

    return value;
  }

  ngOnDestroy(): void {
    this._actionsSubscription?.unsubscribe();
  }

  /**
   * Add a new state to the global defs.
   */
  add(stateClasses: StateClassInternal[]): MappedStore[] {
    if (NG_DEV_MODE) {
      ensureStatesAreDecorated(stateClasses);
    }

    const { newStates } = this.addToStatesMap(stateClasses);
    if (!newStates.length) return [];

    const stateGraph: StateKeyGraph = buildGraph(newStates);
    const sortedStates: string[] = topologicalSort(stateGraph);
    const paths: PlainObjectOf<string> = findFullParentPath(stateGraph);
    const nameGraph: PlainObjectOf<StateClassInternal> = nameToState(newStates);
    const bootstrappedStores: MappedStore[] = [];

    for (const name of sortedStates) {
      const stateClass: StateClassInternal = nameGraph[name];
      const path: string = paths[name];
      const meta: MetaDataModel = stateClass[ɵMETA_KEY]!;

      this.addRuntimeInfoToMeta(meta, path);

      // Note: previously we called `ensureStateClassIsInjectable` within the
      // `State` decorator. This check is moved here because the `ɵprov` property
      // will not exist on the class in JIT mode (because it's set asynchronously
      // during JIT compilation through `Object.defineProperty`).
      if (NG_DEV_MODE) {
        ensureStateClassIsInjectable(stateClass);
      }

      const stateMap: MappedStore = {
        name,
        path,
        isInitialised: false,
        actions: meta.actions,
        instance: this._injector.get(stateClass),
        defaults: StateFactory._cloneDefaults(meta.defaults)
      };

      // ensure our store hasn't already been added
      // but don't throw since it could be lazy
      // loaded from different paths
      if (!this.hasBeenMountedAndBootstrapped(name, path)) {
        bootstrappedStores.push(stateMap);
      }

      this.states.push(stateMap);
    }

    return bootstrappedStores;
  }

  /**
   * Add a set of states to the store and return the defaults
   */
  addAndReturnDefaults(stateClasses: StateClassInternal[]): StatesAndDefaults {
    const classes: StateClassInternal[] = stateClasses || [];

    const mappedStores: MappedStore[] = this.add(classes);
    const defaults = mappedStores.reduce(
      (result: any, mappedStore: MappedStore) =>
        setValue(result, mappedStore.path, mappedStore.defaults),
      {}
    );
    return { defaults, states: mappedStores };
  }

  connectActionHandlers(): void {
    // Note: We have to connect actions only once when the `StateFactory`
    //       is being created for the first time. This checks if we're in
    //       a child state factory and the parent state factory already exists.
    if (this._parentFactory || this._actionsSubscription !== null) {
      return;
    }

    const dispatched$ = new Subject<ActionContext>();
    this._actionsSubscription = this._actions
      .pipe(
        filter((ctx: ActionContext) => ctx.status === ActionStatus.Dispatched),
        mergeMap(ctx => {
          dispatched$.next(ctx);
          const action = ctx.action;
          return this.invokeActions(dispatched$, action!).pipe(
            map(() => <ActionContext>{ action, status: ActionStatus.Successful }),
            defaultIfEmpty(<ActionContext>{ action, status: ActionStatus.Canceled }),
            catchError(error =>
              of(<ActionContext>{ action, status: ActionStatus.Errored, error })
            )
          );
        })
      )
      .subscribe(ctx => this._actionResults.next(ctx));
  }

  /**
   * Invoke actions on the states.
   */
  invokeActions(dispatched$: Observable<ActionContext>, action: any) {
    const type = getActionTypeFromInstance(action)!;
    const results = [];

    // Determines whether the dispatched action has been handled, this is assigned
    // to `true` within the below `for` loop if any `actionMetas` has been found.
    let actionHasBeenHandled = false;

    for (const metadata of this.states) {
      const actionMetas = metadata.actions[type];

      if (actionMetas) {
        for (const actionMeta of actionMetas) {
          const stateContext = this._stateContextFactory.createStateContext(metadata);
          try {
            let result = metadata.instance[actionMeta.fn](stateContext, action);

            // We need to use `isPromise` instead of checking whether
            // `result instanceof Promise`. In zone.js patched environments, `global.Promise`
            // is the `ZoneAwarePromise`. Some APIs, which are likely not patched by zone.js
            // for certain reasons, might not work with `instanceof`. For instance, the `fetch`
            // response `json()` was returning a native promise (not a `ZoneAwarePromise`),
            // causing this check to be falsy.
            if (ɵisPromise(result)) {
              result = from(result);
            }

            if (isObservable(result)) {
              // If this observable has been completed w/o emitting
              // any value then we wouldn't want to complete the whole chain
              // of actions. Since if any observable completes then
              // action will be canceled.
              // For instance if any action handler would've had such statement:
              // `handler(ctx) { return EMPTY; }`
              // then the action will be canceled.
              // See https://github.com/ngxs/store/issues/1568
              result = result.pipe(
                mergeMap((value: any) => {
                  if (ɵisPromise(value)) {
                    return from(value);
                  }
                  if (isObservable(value)) {
                    return value;
                  }
                  return of(value);
                }),
                defaultIfEmpty({})
              );

              if (actionMeta.options.cancelUncompleted) {
                // todo: ofActionDispatched should be used with action class
                result = result.pipe(
                  takeUntil(dispatched$.pipe(ofActionDispatched(action as any)))
                );
              }
            } else {
              result = of({}).pipe(shareReplay());
            }

            results.push(result);
          } catch (e) {
            results.push(throwError(e));
          }

          actionHasBeenHandled = true;
        }
      }
    }

    // The `NgxsUnhandledActionsLogger` is a tree-shakable class which functions
    // only during development.
    if (NG_DEV_MODE && !actionHasBeenHandled) {
      const unhandledActionsLogger = this._injector.get(NgxsUnhandledActionsLogger, null);
      // The `NgxsUnhandledActionsLogger` will not be resolved by the injector if the
      // `NgxsDevelopmentModule` is not provided. It's enough to check whether the `injector.get`
      // didn't return `null` so we may ensure the module has been imported.
      if (unhandledActionsLogger) {
        unhandledActionsLogger.warn(action);
      }
    }

    if (!results.length) {
      results.push(of({}));
    }

    return forkJoin(results);
  }

  private addToStatesMap(stateClasses: StateClassInternal[]): {
    newStates: StateClassInternal[];
  } {
    const newStates: StateClassInternal[] = [];
    const statesMap: StatesByName = this.statesByName;

    for (const stateClass of stateClasses) {
      const stateName = getStoreMetadata(stateClass).name!;
      if (NG_DEV_MODE) {
        ensureStateNameIsUnique(stateName, stateClass, statesMap);
      }
      const unmountedState = !statesMap[stateName];
      if (unmountedState) {
        newStates.push(stateClass);
        statesMap[stateName] = stateClass;
      }
    }

    return { newStates };
  }

  private addRuntimeInfoToMeta(meta: MetaDataModel, path: string): void {
    this.statePaths[meta.name!] = path;
    // TODO: v4 - we plan to get rid of the path property because it is non-deterministic
    // we can do this when we get rid of the incorrectly exposed getStoreMetadata
    // We will need to come up with an alternative in v4 because this is used by many plugins
    meta.path = path;
  }

  private hasBeenMountedAndBootstrapped(name: string, path: string): boolean {
    const valueIsBootstrappedInInitialState: boolean =
      getValue(this._initialState, path) !== undefined;
    // This checks whether a state has been already added to the global graph and
    // its lifecycle is in 'bootstrapped' state.
    return this.statesByName[name] && valueIsBootstrappedInInitialState;
  }
}
