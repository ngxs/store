import { inject, Injectable, ɵisPromise } from '@angular/core';
import {
  defaultIfEmpty,
  finalize,
  from,
  isObservable,
  mergeMap,
  type Observable,
  of,
  takeUntil
} from 'rxjs';
import type { ɵActionOptions } from '@ngxs/store/internals';

import { InternalActions } from '../actions-stream';
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
    const { dispatched$ } = this._actions;

    return (action: any) => {
      const stateContext = this._stateContextFactory.createStateContext(path);

      let result = handlerFn(stateContext, action);

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
          mergeMap(value => (ɵisPromise(value) || isObservable(value) ? value : of(value))),
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

        if (options.cancelUncompleted) {
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
