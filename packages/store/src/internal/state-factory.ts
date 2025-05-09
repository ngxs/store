import { DestroyRef, Injectable, Injector, inject, ɵisPromise } from '@angular/core';
import {
  ɵmemoize,
  ɵMETA_KEY,
  ɵPlainObjectOf,
  ɵMetaDataModel,
  ɵgetStoreMetadata,
  ɵStateClassInternal,
  ɵINITIAL_STATE_TOKEN,
  ɵSharedSelectorOptions,
  ɵRuntimeSelectorContext,
  ɵNgxsActionRegistry
} from '@ngxs/store/internals';
import { getActionTypeFromInstance, getValue, setValue } from '@ngxs/store/plugins';
import { ɵof } from '@ngxs/store/internals';
import {
  forkJoin,
  from,
  isObservable,
  Subscription,
  throwError,
  catchError,
  defaultIfEmpty,
  filter,
  map,
  mergeMap,
  takeUntil,
  finalize,
  Observable
} from 'rxjs';

import { NgxsConfig } from '../symbols';
import {
  buildGraph,
  findFullParentPath,
  MappedStore,
  nameToState,
  ɵPROP_GETTER,
  StateKeyGraph,
  StatesAndDefaults,
  StatesByName,
  topologicalSort
} from './internals';
import { ActionContext, ActionStatus, InternalActions } from '../actions-stream';
import { InternalDispatchedActionResults } from '../internal/action-results';
import { ensureStateNameIsUnique, ensureStatesAreDecorated } from '../utils/store-validators';
import { ensureStateClassIsInjectable } from '../ivy/ivy-enabled-in-dev-mode';
import { NgxsUnhandledActionsLogger } from '../dev-features/ngxs-unhandled-actions-logger';
import { NgxsUnhandledErrorHandler } from '../ngxs-unhandled-error-handler';
import { assignUnhandledCallback } from './unhandled-rxjs-error-callback';
import { StateContextFactory } from './state-context-factory';
import { ofActionDispatched } from '../operators/of-action';

function cloneDefaults(defaults: any): any {
  let value = defaults === undefined ? {} : defaults;

  if (defaults) {
    if (Array.isArray(defaults)) {
      value = defaults.slice();
    } else if (typeof defaults === 'object') {
      value = { ...defaults };
    }
  }

  return value;
}

/**
 * The `StateFactory` class adds root and feature states to the graph.
 * This extracts state names from state classes, checks if they already
 * exist in the global graph, throws errors if their names are invalid, etc.
 *
 * Root and feature initializers call `addAndReturnDefaults()` to add those states
 * to the global graph. Since `addAndReturnDefaults` runs within the injection
 * context (which might be the root injector or a feature injector), we can
 * retrieve an instance of the state class using `inject(StateClass)`.
 * @ignore
 */
@Injectable({ providedIn: 'root' })
export class StateFactory {
  private readonly _injector = inject(Injector);
  private readonly _config = inject(NgxsConfig);
  private readonly _stateContextFactory = inject(StateContextFactory);
  private readonly _actions = inject(InternalActions);
  private readonly _actionResults = inject(InternalDispatchedActionResults);
  private readonly _initialState = inject(ɵINITIAL_STATE_TOKEN, { optional: true });
  private readonly _actionRegistry = inject(ɵNgxsActionRegistry);
  private readonly _propGetter = inject(ɵPROP_GETTER);

  private _actionsSubscription: Subscription | null = null;

  private _ngxsUnhandledErrorHandler: NgxsUnhandledErrorHandler = null!;

  private _states: MappedStore[] = [];
  private _statesByName: StatesByName = {};
  private _statePaths: ɵPlainObjectOf<string> = {};

  getRuntimeSelectorContext = ɵmemoize(() => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const stateFactory = this;
    const propGetter = stateFactory._propGetter;

    function resolveGetter(key: string) {
      const path = stateFactory._statePaths[key];
      return path ? propGetter(path.split('.')) : null;
    }

    const context: ɵRuntimeSelectorContext = {
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
      getSelectorOptions(localOptions?: ɵSharedSelectorOptions) {
        const globalSelectorOptions = stateFactory._config.selectorOptions;
        return {
          ...globalSelectorOptions,
          ...(localOptions || {})
        };
      }
    };
    return context;
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this._actionsSubscription?.unsubscribe());
  }

  /**
   * Add a new state to the global defs.
   */
  private add(stateClasses: ɵStateClassInternal[]): MappedStore[] {
    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
      ensureStatesAreDecorated(stateClasses);
    }

    const { newStates } = this.addToStatesMap(stateClasses);
    if (!newStates.length) return [];

    const stateGraph: StateKeyGraph = buildGraph(newStates);
    const sortedStates: string[] = topologicalSort(stateGraph);
    const paths: ɵPlainObjectOf<string> = findFullParentPath(stateGraph);
    const nameGraph: ɵPlainObjectOf<ɵStateClassInternal> = nameToState(newStates);
    const bootstrappedStores: MappedStore[] = [];

    for (const name of sortedStates) {
      const stateClass: ɵStateClassInternal = nameGraph[name];
      const path: string = paths[name];
      const meta: ɵMetaDataModel = stateClass[ɵMETA_KEY]!;

      this.addRuntimeInfoToMeta(meta, path);

      if (typeof ngDevMode !== 'undefined' && ngDevMode) {
        ensureStateClassIsInjectable(stateClass);
      }

      const stateMap: MappedStore = {
        name,
        path,
        isInitialised: false,
        actions: meta.actions,
        instance: inject(stateClass),
        defaults: cloneDefaults(meta.defaults)
      };

      // ensure our store hasn't already been added
      // but don't throw since it could be lazy
      // loaded from different paths
      if (!this.hasBeenMountedAndBootstrapped(name, path)) {
        bootstrappedStores.push(stateMap);
      }

      this._states.push(stateMap);
      this.hydrateActionMetasMap(stateMap);
    }

    return bootstrappedStores;
  }

  /**
   * Add a set of states to the store and return the defaults
   */
  addAndReturnDefaults(stateClasses: ɵStateClassInternal[]): StatesAndDefaults {
    const classes: ɵStateClassInternal[] = stateClasses || [];

    const mappedStores: MappedStore[] = this.add(classes);
    const defaults = mappedStores.reduce(
      (result: any, mappedStore: MappedStore) =>
        setValue(result, mappedStore.path, mappedStore.defaults),
      {}
    );
    return { defaults, states: mappedStores };
  }

  connectActionHandlers(): void {
    this._actionsSubscription = this._actions
      .pipe(
        filter((ctx: ActionContext) => ctx.status === ActionStatus.Dispatched),
        mergeMap(ctx => {
          const action: any = ctx.action;
          return this.invokeActions(action).pipe(
            map(() => <ActionContext>{ action, status: ActionStatus.Successful }),
            defaultIfEmpty(<ActionContext>{ action, status: ActionStatus.Canceled }),
            catchError(error => {
              const ngxsUnhandledErrorHandler = (this._ngxsUnhandledErrorHandler ||=
                this._injector.get(NgxsUnhandledErrorHandler));
              const handleableError = assignUnhandledCallback(error, () =>
                ngxsUnhandledErrorHandler.handleError(error, { action })
              );
              return ɵof(<ActionContext>{
                action,
                status: ActionStatus.Errored,
                error: handleableError
              });
            })
          );
        })
      )
      .subscribe(ctx => this._actionResults.next(ctx));
  }

  /**
   * Invoke actions on the states.
   */
  private invokeActions(action: any): Observable<unknown[]> {
    const type = getActionTypeFromInstance(action)!;
    const results: Observable<unknown>[] = [];

    // Determines whether the dispatched action has been handled, this is assigned
    // to `true` within the below `for` loop if any `actionMetas` has been found.
    let actionHasBeenHandled = false;

    const actionHandlers = this._actionRegistry.get(type);

    if (actionHandlers) {
      for (const actionHandler of actionHandlers) {
        let result;

        try {
          result = actionHandler(action);
        } catch (e) {
          result = throwError(() => e);
        }

        results.push(result);

        actionHasBeenHandled = true;
      }
    }

    // The `NgxsUnhandledActionsLogger` is a tree-shakable class which functions
    // only during development.
    if (typeof ngDevMode !== 'undefined' && ngDevMode && !actionHasBeenHandled) {
      const unhandledActionsLogger = this._injector.get(NgxsUnhandledActionsLogger, null);
      // The `NgxsUnhandledActionsLogger` will not be resolved by the injector if the
      // `NgxsDevelopmentModule` is not provided. It's enough to check whether the `injector.get`
      // didn't return `null` so we may ensure the module has been imported.
      unhandledActionsLogger?.warn(action);
    }

    if (!results.length) {
      results.push(ɵof(undefined));
    }

    return forkJoin(results);
  }

  private addToStatesMap(stateClasses: ɵStateClassInternal[]): {
    newStates: ɵStateClassInternal[];
  } {
    const newStates: ɵStateClassInternal[] = [];
    const statesMap: StatesByName = this._statesByName;

    for (const stateClass of stateClasses) {
      const stateName = ɵgetStoreMetadata(stateClass).name!;
      if (typeof ngDevMode !== 'undefined' && ngDevMode) {
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

  private addRuntimeInfoToMeta(meta: ɵMetaDataModel, path: string): void {
    this._statePaths[meta.name!] = path;
    // TODO: versions after v3 - we plan to get rid of the `path` property because it is non-deterministic
    // we can do this when we get rid of the incorrectly exposed getStoreMetadata
    // We will need to come up with an alternative to what was exposed in v3 because this is used by many plugins
    meta.path = path;
  }

  private hasBeenMountedAndBootstrapped(name: string, path: string): boolean {
    const valueIsBootstrappedInInitialState: boolean =
      getValue(this._initialState, path) !== undefined;
    // This checks whether a state has been already added to the global graph and
    // its lifecycle is in 'bootstrapped' state.
    return this._statesByName[name] && valueIsBootstrappedInInitialState;
  }

  private hydrateActionMetasMap({ path, actions, instance }: MappedStore): void {
    const { dispatched$ } = this._actions;
    for (const actionType of Object.keys(actions)) {
      const actionHandlers = actions[actionType].map(actionMeta => {
        const cancelable = !!actionMeta.options.cancelUncompleted;

        return (action: any) => {
          const stateContext = this._stateContextFactory.createStateContext(path);

          let result = instance[actionMeta.fn](stateContext, action);

          // We need to use `isPromise` instead of checking whether
          // `result instanceof Promise`. In zone.js patched environments, `global.Promise`
          // is the `ZoneAwarePromise`. Some APIs, which are likely not patched by zone.js
          // for certain reasons, might not work with `instanceof`. For instance, the dynamic
          // import returns a native promise (not a `ZoneAwarePromise`), causing this check to
          // be falsy.
          if (ɵisPromise(result)) {
            result = from(result);
          }

          if (isObservable(result)) {
            result = result.pipe(
              mergeMap((value: any) => {
                if (ɵisPromise(value) || isObservable(value)) {
                  return value;
                } else {
                  return ɵof(value);
                }
              }),
              // If this observable has completed without emitting any values,
              // we wouldn't want to complete the entire chain of actions.
              // If any observable completes, then the action will be canceled.
              // For instance, if any action handler had a statement like
              // `handler(ctx) { return EMPTY; }`, then the action would be canceled.
              // See https://github.com/ngxs/store/issues/1568
              // Note that we actually don't care about the return type; we only care
              // about emission, and thus `undefined` is applicable by the framework.
              defaultIfEmpty(undefined)
            );

            if (cancelable) {
              const canceled = dispatched$.pipe(ofActionDispatched(action));
              result = result.pipe(takeUntil(canceled));
            }

            result = result.pipe(
              // Note that we use the `finalize` operator only when the action handler
              // explicitly returns an observable (or a promise) to wait for. This means
              // the action handler is written in a "fire & wait" style. If the handler’s
              // result is unsubscribed (either because the observable has completed or
              // it was unsubscribed by `takeUntil` due to a new action being dispatched),
              // we prevent writing to the state context.
              finalize(() => {
                stateContext.setState = noop;
                stateContext.patchState = noop;
              })
            );
          } else {
            // If the action handler is synchronous and returns nothing (`void`), we
            // still have to convert the result to a synchronous observable.
            result = ɵof(undefined);
          }

          return result;
        };
      });

      for (const actionHandler of actionHandlers) {
        this._actionRegistry.register(actionType, actionHandler);
      }
    }
  }
}

// This is used to replace `setState` and `patchState` once the action
// handler has been unsubscribed or completed, to prevent writing
// to the state context.
function noop() {}
