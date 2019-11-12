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
  @Select(state => state.count.number.value) count$: Observable<number>;
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

getCount(); // will throw
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
      // Automatic unsubscription will occur if you use the `throw` statement here. Skip it if you don't want the stream to be completed on error.
      // Do not do this if you do not want it.
    }
  })
  count$: Observable<number>;
}
```

#### Why does Rxjs unsubscribe on error?

An explanation of why this matters can be found from RxJS design [guidelines](https://github.com/ReactiveX/rxjs/blob/master/docs_app/content/guide/observable.md#executing-observables).

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
