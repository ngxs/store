# Error Handling

NGXS uses Angular's default `ErrorHandler` class, so if an action throws an error, Angular's `ErrorHandler` is called. You can easily override this flow by providing your own handler like so:

```ts
import { NgModule, ErrorHandler } from '@angular/core';

@Injectable()
export class MyErrorHandler implements ErrorHandler {
  handleError(error: any) {
    console.log('ERROR! ', error);

    // Make sure to rethrow the error so Angular can pick it up
    throw error;
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

## Handling errors within an `@Select`

```ts
@Component({
  /* .. */
})
class AppComponent {
  @Select(state => state.count.number.value)
  public count$: Observable<number>;
}
```

One of the main problems is that if your application state is not correct later.

```ts
this.store.reset({}); // destroy all states
```

Then automatically all subscribers will be unsubscribed from the store, as an internal error will occur.
To track such things, you must disable `suppressErrors` flag:

```ts
@NgModule({
  imports: [
    NgxsModule.forRoot([CountState], {
      selectorOptions: {
        suppressErrors: false // default by true
      }
    })
  ]
})
export class AppModule {}
```

This way you can track application errors and add error handling.

```ts
@Component({
  /* .. */
})
class AppComponent {
  @Select(state => {
    try {
      return state.count.number.value;
    } catch (err) {
      console.log('error', err);
      // throw err;
      // If you forward an error further, then an automatic unsubscription from the stream will occur.
      // Do not do this if you do not want it.
    }
  })
  public count$: Observable<number>;
}
```

#### Why does Rxjs unsubscribe on error?

An explanation of why this matters can be found from Rx design guidelines:

The single message indicating that an observable sequence has finished ensures that consumers of the observable sequence can deterministically establish that it is safe to perform cleanup operations.

A single failure further ensures that abort semantics can be maintained for operators that work on multiple observable sequences.

In short, if you want your observers to keep listening to the store after a error has occurred, do not deliver that error to the store, but rather handle it in some other way (e.g. use catch, retry or deliver the error to a dedicated subject).

```ts
this.store.select(CountState).pipe(
  retryWhen(errors =>
    errors.pipe(
      // log error message
      tap(val => console.log(`Value ${val} was too high!`)),
      // restart in 6 seconds
      delayWhen(val => timer(val * 1000))
    )
  )
);
```

If you have some reason to pass on the error yet still not close the observable, then you can just catch and return the Error instead of throwing it. That way the type of the observable goes from `Observable<T>` to `Observable<T | Error>` and the observable doesn't close on error.

## Handling errors within an `@Action`

When you define an @Action you can handle error within the action and if you do so, the error will not propagate to Angular's global `ErrorHandler`, nor the `dispatch` Observable. This applies to both sync and async types of Actions.

```ts
  @Action(HandledError)
  handledError(ctx: StateContext<StateModel>) {
    try {
      // error is thrown
    } catch (err) {
      console.log('error catched inside @Action wont propagate to ErrorHandler or dispatch subscription')
    }
  }
```

## Handling errors after dispatching an action

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

It is recommended to handle errors within `@Action` and update state to reflect the error, which you can later the select to display where required

You can play around with error handling in this following [stackblitz](https://stackblitz.com/edit/ngxs-error-handling)
