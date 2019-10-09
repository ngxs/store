# Error Handling

NGXS uses Angular's default `ErrorHandler` class, so if an action throws an error, Angular's `ErrorHandler` is called. You can easily override this flow by providing your own handler like so:

```TS
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
export class AppModule { }
```

## Handling errors within an `@Action`

When you define an @Action you can handle error within the action and if you do so, the error will not propagate to Angular's global `ErrorHandler`, nor the `dispatch` Observable. This applies to both sync and async types of Actions.

```TS
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

```TS
  @Action(UnhandledError)
  unhandledError(ctx: StateContext<StateModel>) {
    // error is thrown
  }
```

```TS
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
