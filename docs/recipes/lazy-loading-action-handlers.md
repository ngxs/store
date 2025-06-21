# Lazy Loading Action Handlers

NGXS actions can sometimes become large or require code-splitting due to application size. The `callAsync()` utility allows you to dynamically load and run action logic only when it's needed — improving bundle size and startup performance.

The `callAsync()` helper makes it easy to lazy-load action handler modules, run operations inside the Angular injector context when needed, and handle async, observable, or synchronous results seamlessly.

````ts
import {
  DestroyRef,
  ɵisPromise,
  runInInjectionContext,
  type EnvironmentInjector
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, from, isObservable, Observable, of, switchMap } from 'rxjs';

export interface CallAsyncParams<T> {
  injector: EnvironmentInjector;
  actionLoader: () => Promise<T>;
  asyncOperation: (impl: T) => Promise<void> | Observable<unknown> | void;
}

/**
 * This function is intended for use within NGXS actions, which may load
 * other action handlers asynchronously.
 *
 * The signature is the following:
 *
 * ```ts
 * return callAsync({
 *   injector: this._environmentInjector,
 *   actionLoader: () => import('./action-handlers/validate-store-payment'),
 *   asyncOperation: (m) => m.validateStorePayment(ctx, this._store, action),
 * });
 * ```
 */
export function callAsync<T>(params: CallAsyncParams<T>) {
  if (params.injector.destroyed) {
    return EMPTY;
  }

  const destroyRef = params.injector.get(DestroyRef);

  return from(params.actionLoader()).pipe(
    switchMap(impl => {
      const result = runInInjectionContext(params.injector, () => params.asyncOperation(impl));

      // If the `asyncOperation` is asynchronous and requires the inner
      // observable to be subscribed to, we then return it to `switchMap`.
      if (isObservable(result) || ɵisPromise(result)) {
        return result;
      }

      return of(undefined);
    }),
    takeUntilDestroyed(destroyRef)
  );
}
````

## Usage

In the example below, `validate-store-payment.ts` is only loaded when the `ValidateStorePayment` action is dispatched. The module exports a `validateStorePayment()` function that contains the actual logic, so users who never trigger this action pay no bundle cost for it.

```ts
export class MyState {
  private _injector = inject(EnvironmentInjector);

  @Action(ValidateStorePayment)
  validateStorePayment(ctx: StateContext<StateModel>, action: ValidateStorePayment) {
    return callAsync({
      injector: this._injector,
      actionLoader: () => import('./action-handlers/validate-store-payment'),
      asyncOperation: m => m.validateStorePayment(ctx, action)
    });
  }
}
```

```ts
// action-handlers/validate-store-payment.ts

export function validateStorePayment(
  ctx: StateContext<StateModel>,
  action: ValidateStorePayment
) {
  const service = inject(MyService);

  return service.doSomeAsyncStuff(...);
}
```

## Directory Structure Suggestion

```
states/
├── my.state.ts
├── action-handlers/
│   └── validate-store-payment.ts ← lazy-loaded
```
