import { inject, Injectable, OnDestroy, ɵisPromise } from '@angular/core';
import {
  defaultIfEmpty,
  from,
  isObservable,
  mergeMap,
  Observable,
  of,
  shareReplay,
  takeUntil,
  throwError
} from 'rxjs';
import { ɵActionHandlerMetaData } from '@ngxs/store/internals';

import { ofActionDispatched } from '../operators/of-action';
import { StateContextFactory } from '../internal/state-context-factory';
import { ɵNgxsInternalDispatchedActions } from './dispatched-actions';

// `action: Instance<ActionType>`.
type ActionHandlerFn = (action: any) => void | Promise<void> | Observable<unknown>;

interface InvokableActionHandlerMetaData extends ɵActionHandlerMetaData {
  path: string;
  instance: any;
}

@Injectable({ providedIn: 'root' })
export class NgxsActionRegistry implements OnDestroy {
  // Instead of going over the states list every time an action is dispatched,
  // we are constructing a map of action types to lists of action metadata.
  // If the `@@Init` action is handled in two different states, the action
  // metadata list will contain two objects that have the state `instance` and
  // method names to be used as action handlers (decorated with `@Action(InitState)`).
  private readonly _actionTypeToHandlersMap = new Map<string, Set<ActionHandlerFn>>();

  private readonly _stateContextFactory = inject(StateContextFactory);

  private readonly _dispatched$ = inject(ɵNgxsInternalDispatchedActions);

  ngOnDestroy(): void {
    this._actionTypeToHandlersMap.clear();
  }

  get(type: string) {
    return this._actionTypeToHandlersMap.get(type);
  }

  register(type: string, actionMeta: InvokableActionHandlerMetaData) {
    const handlers = this._actionTypeToHandlersMap.get(type) ?? new Set();
    const handler = this._createActionHandler(actionMeta);
    handlers.add(handler);
    this._actionTypeToHandlersMap.set(type, handlers);

    return () => {
      const handlers = this._actionTypeToHandlersMap.get(type)!;
      handlers.delete(handler);
    };
  }

  private _createActionHandler(actionMeta: InvokableActionHandlerMetaData) {
    // `action: Instance<ActionType>`.
    const dispatched$ = this._dispatched$;

    return (action: any) => {
      const stateContext = this._stateContextFactory.createStateContext(actionMeta.path);

      let result;
      try {
        result = actionMeta.instance[actionMeta.fn](stateContext, action);

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
              if (ɵisPromise(value)) {
                return from(value);
              }
              if (isObservable(value)) {
                return value;
              }
              return of(value);
            }),
            // If this observable has completed without emitting any values,
            // we wouldn't want to complete the entire chain of actions.
            // If any observable completes, then the action will be canceled.
            // For instance, if any action handler had a statement like
            // `handler(ctx) { return EMPTY; }`, then the action would be canceled.
            // See https://github.com/ngxs/store/issues/1568
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
      } catch (e) {
        result = throwError(e);
      }

      return result;
    };
  }
}
