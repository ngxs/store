import { inject, Injectable, ɵisPromise } from '@angular/core';
import {
  defaultIfEmpty,
  finalize,
  from,
  isObservable,
  mergeMap,
  Observable,
  of,
  takeUntil
} from 'rxjs';
import type { ɵActionOptions } from '@ngxs/store/internals';

import { InternalActions } from '../actions-stream';
import { throwActionOptionsConflictError } from '../configs/messages.config';
import { ofActionDispatched } from '../operators/of-action';
import { StateContextFactory } from './state-context-factory';
import type { StateContext } from '../symbols';

@Injectable({ providedIn: 'root' })
export class InternalActionHandlerFactory {
  private readonly _actions = inject(InternalActions);
  private readonly _stateContextFactory = inject(StateContextFactory);

  createActionHandler(
    path: string,
    handlerFn: (ctx: StateContext<any>, action: any) => any,
    options: ɵActionOptions
  ): (action: any) => Observable<any> {
    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
      if (options.cancelUncompleted && options.ignoreUncompleted) {
        throwActionOptionsConflictError();
      }
    }

    const { dispatched$ } = this._actions;
    // Tracks whether a previously dispatched, still-uncompleted invocation of
    // this exact handler is in flight. Only used for `ignoreUncompleted`.
    let isUncompleted = false;

    return (action: any) => {
      if (options.ignoreUncompleted && isUncompleted) {
        return of(undefined);
      }

      const abortController = new AbortController();
      const stateContext = this._stateContextFactory.createStateContext(
        path,
        abortController.signal
      );

      let result = handlerFn(stateContext, action);

      // Use `isPromise` here, not `result instanceof Promise`. With zone.js
      // loaded, `global.Promise` is `ZoneAwarePromise`, but a few APIs hand back
      // a native promise instead - e.g. dynamic `import()` - and `instanceof`
      // would miss those.
      if (ɵisPromise(result)) {
        result = from(result);
      }

      if (isObservable(result)) {
        result = result.pipe(
          mergeMap(value => (ɵisPromise(value) || isObservable(value) ? value : of(value))),
          // If this observable has completed without emitting any values,
          // we wouldn't want to complete the entire chain of actions.
          // If any observable completes, then the action will be canceled.
          // For instance, if any action handler had a statement like
          // `handler(ctx) { return EMPTY; }`, then the action would be canceled.
          // See https://github.com/ngxs/store/issues/1568
          defaultIfEmpty(undefined)
        );

        if (options.cancelUncompleted) {
          const canceled = dispatched$.pipe(ofActionDispatched(action));
          result = result.pipe(
            takeUntil(
              new Observable<void>(subscriber => {
                return canceled.subscribe(() => {
                  // No `catchError` needed for abort errors here - we cancel the
                  // observable before the error is ever thrown.
                  abortController.abort();
                  subscriber.next();
                });
              })
            )
          );
        }

        if (options.ignoreUncompleted) {
          isUncompleted = true;
          result = result.pipe(
            finalize(() => {
              isUncompleted = false;
            })
          );
        }

        result = result.pipe(
          // We only reach this `finalize` when the handler returned an
          // observable or promise to wait on ("fire & wait" style). Once that
          // result is done - completed, or cut off by `takeUntil` when a new
          // action comes in - block any further writes to the state context.
          finalize(() => {
            if (typeof ngDevMode !== 'undefined' && ngDevMode) {
              function noopAndWarn() {
                console.warn(
                  `"${action}" attempted to change the state, but the change was ignored because state updates are not allowed after the action handler has completed.`
                );
              }

              stateContext.setState = noopAndWarn;
              stateContext.patchState = noopAndWarn;
            } else {
              stateContext.setState = noop;
              stateContext.patchState = noop;
            }
          })
        );
      } else {
        // If the action handler is synchronous and returns nothing (`void`), we
        // still have to convert the result to a synchronous observable.
        result = of(undefined);
      }

      return result;
    };
  }
}

// This is used to replace `setState` and `patchState` once the action
// handler has been unsubscribed or completed, to prevent writing
// to the state context.
function noop() {}
