# Error Handling

NGXS uses Angular's default `ErrorHandler` class, so if an action throws an error, Angular's `ErrorHandler` is called. You can easily override this flow by providing your own handler like so:

```ts
import { NgModule, ErrorHandler } from '@angular/core';

@Injectable()
export class MyErrorHandler implements ErrorHandler {
  handleError(error: any) {
    console.log('ERROR! ', error);
  }
}

@NgModule({
  imports: [AppComponent],
  providers: [
    {
      provide: ErrorHandler,
      useClass: MyErrorHandler
    }
  ]
})
export class AppModule {}
```

## Handling Errors Within a `select`

```ts
@Component({ ... })
class AppComponent {
  count$: Observable<number> = this.store.select(state => state.count.number.value);

  constructor(private store: Store) {}
}
```

Let's take a look at the below example:

```ts
this.store.reset({}); // reset all states
```

The catch is that when resetting the entire state, the object will no longer have those deeply nested properties (`state.count.number.value`). Given the following code:

```ts
const state = {};

function getCount() {
  return state.count.number.value;
}

const count = getCount(); // will throw
```

RxJS will automatically complete the stream under the hood if any error is thrown.

You have to disable suppressing errors using the `suppressErrors` option:

```ts
@NgModule({
  imports: [
    NgxsModule.forRoot([CountState], {
      selectorOptions: {
        suppressErrors: false // `true` by default
      }
    })
  ]
})
export class AppModule {}
```

This option allows to track errors and handle them.

```ts
@Component({ ... })
class AppComponent {
  count$: Observable<number> = this.store.select(state => {
    try {
      return state.count.number.value;
    } catch (error) {
      console.log('error', error);
      // throw error;
      // Automatic unsubscription will occur if you use the `throw` statement here. Skip it if you don't want the stream to be completed on error.
    }
  });

  constructor(private store: Store) {}
}
```

#### Why does RxJS unsubscribe on error?

RxJS [design guidelines](https://github.com/ReactiveX/rxjs/blob/master/docs_app/content/guide/observable.md#executing-observables) provides a great explanation of this behavior.

## Handling Errors Within an `@Action`

When you define an `@Action`, you can handle the error within the action, and if you do so, the error will not propagate to Angular's global `ErrorHandler` nor the `dispatch` Observable. This applies to both sync and async types of Actions.

```ts
  @Action(HandledError)
  handledError(ctx: StateContext<StateModel>) {
    try {
      // error is thrown
    } catch (err) {
      console.log('error catched inside @Action will not propagate to ErrorHandler or dispatch subscription')
    }
  }
```

You can return an observable that completes immediately after the error has been handled when dealing with streams:

```ts
  @Action(HandledError)
  handledError(ctx: StateContext<StateModel>) {
    return this.myService.doSomeApiCall().pipe(
      catchError(error => {
        handleError(error);
        return EMPTY;
      })
    );
  }
```

## Handling Errors After Dispatching an Action

If an unhandled exception is thrown inside an action, the error will be propagated to the `ErrorHandler` and you can also catch it subscribing to the `dispatch` Observable. If you subscribe to the `dispatch` Observable the error will be caught twice, once in the ErrorHandler and on your `dispatch` handle.

```ts
  @Action(UnhandledError)
  unhandledError(ctx: StateContext<StateModel>) {
    // error is thrown
  }
```

```ts
  unhandled() {
    this.store.dispatch(new UnhandledError()).pipe(
      catchError(err => {
        console.log('unhandled error on dispatch subscription')
        return of('')
      })
    ).subscribe();
  }
```

It is recommended to handle errors within `@Action` and update state to reflect the error, which you can later select to display where required.

You can play around with error handling in this following [stackblitz](https://stackblitz.com/edit/ngxs-error-handling)

## Switching to Angular Error Handling Mechanism

NGXS catches errors from actions explicitly. Which means NGXS subscribes to the `dispatch()` result and calls `handleError` within the error callback:

```ts
result.subscribe({
  error: error => errorHandler.handleError(error)
});
```

The explicit error handling mechanism is necessary due to the NGXS action handling strategy. By default, the action handling process in NGXS leaves the Angular zone, causing NGXS actions to be invoked within the `<root>` zone context. Any caught actions must be returned to the Angular error handler for proper handling.

However, this setup can lead to issues when developers manually handle errors, as NGXS may still call to the `ErrorHandler`.

Angular's default error-handling mechanism relies on the inclusion of zone.js. The modified Angular zone includes an `onHandleError` hook that triggers `zone.onError.emit(error)` whenever an error is caught within the Angular zone. Angular subscribes to `onError` during the `bootstrapModuleFactory` process.

When `enableDualErrorHandling` is truthy (which is the default setting) NGXS would always call to `ErrorHandler.handleError` regardless of the `error` observer on the dispatch observable.

Developers have the option to disable the default NGXS error handling mechanism if desired:

```ts
@NgModule({
  imports: [
    NgxsModule.forRoot(
      [
        /* states */
      ],
      {
        enableDualErrorHandling: false
      }
    )
  ]
})
export class AppModule {}
```

Setting `enableDualErrorHandling` to `false` enables calling `ErrorHandler` only when errors are not being handled manually by developers. This requires zone.js to be enabled and may also cause issues in unit tests because the runtime behavior differs for unit tests.
