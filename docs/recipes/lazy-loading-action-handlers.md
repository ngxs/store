# Lazy Loading Action Handlers

NGXS actions can sometimes become large or require code-splitting due to application size. The `callAsync()` utility allows you to dynamically load and run action logic only when it's needed — improving bundle size and startup performance.

The callAsync() helper makes it easy to:

- Lazy-load action handler modules
- Run operations inside the Angular injector context (if needed)
- Handle **async**, **observable**, or **sync** results seamlessly

````ts
import { ɵisPromise, runInInjectionContext, type Injector } from '@angular/core';
import { from, isObservable, Observable, of, switchMap } from 'rxjs';

export interface CallAsyncParams<T> {
  injector?: Injector;
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
 *   actionLoader: () => import('./action-handlers/validate-store-payment'),
 *   asyncOperation: (m) => m.validateStorePayment(ctx, this._store, action),
 * });
 * ```
 */
export function callAsync<T>(params: CallAsyncParams<T>) {
  return from(params.actionLoader()).pipe(
    switchMap(impl => {
      const result = params.injector
        ? runInInjectionContext(params.injector, () => params.asyncOperation(impl))
        : params.asyncOperation(impl);

      // If the `asyncOperation` is asynchronous and requires the inner
      // observable to be subscribed to, we then return it to `switchMap`.
      if (isObservable(result) || ɵisPromise(result)) {
        return result;
      }

      return of(undefined);
    })
  );
}
````

### Usage

In this example:

- `validate-store-payment.ts` is only loaded when the `ValidateStorePayment` action is dispatched
- The module exports a `validateStorePayment()` function which contains the actual logic
- This improves performance for users who never trigger this action

```ts
export class MyState {
  private _injector = inject(Injector);

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

### Directory Structure Suggestion

```
states/
├── my.state.ts
├── action-handlers/
│   └── validate-store-payment.ts ← lazy-loaded
```
