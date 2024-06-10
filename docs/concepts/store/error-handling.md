# Error Handling

## How NGXS handles errors

If an unhandled exception is thrown within an action, the error will be passed to the `ErrorHandler`. To manually catch the error, you just need to subscribe to the `dispatch` observable and include an `error` callback. By subscribing and providing an `error` callback, NGXS won't pass the error to its unhandled error handler.

NGXS configures the RxJS [`onUnhandledError`](https://rxjs.dev/api/index/interface/GlobalConfig#onUnhandledError) callback. This property is accessible in RxJS versions 7 and above, which is why NGXS mandates a minimum RxJS version of 7.

The RxJS `onUnhandledError` callback triggers whenever an unhandled error occurs within an observable and no `error` callback has been supplied.

:warning: If you configure `onUnhandledError` after NGXS has loaded, ensure to store the existing implementation in a local variable. You'll need to invoke it when the error shouldn't be handled by your customized error strategy:

```ts
import { config } from 'rxjs';

const existingHandler = config.onUnhandledError;
config.onUnhandledError = function (error: any) {
  if (shouldWeHandleThis(error)) {
    // Do something with this error
  } else {
    existingHandler.call(this, error);
  }
};
```

### Handling errors after dispatching an action

Given the following code:

```ts
class AppState {
  @Action(UnhandledError)
  unhandledError(ctx: StateContext<StateModel>) {
    // error is thrown
  }
}
```

```ts
class AppComponent {
  unhandled() {
    this.store.dispatch(new UnhandledError()).subscribe({
      error: error => {
        console.log('unhandled error on dispatch subscription: ', error);
      }
    });
  }
}
```

It is recommended to handle errors within `@Action` and update the state to reflect the error, which you can later select to display where required.

You can play around with error handling in the following [stackblitz](https://stackblitz.com/edit/ngxs-error-handling)

## Custom unhandled error handler

NGXS provides the `NgxsUnhandledErrorHandler` class, which you can override with your custom implementation to manage unhandled errors according to your requirements:

```ts
import { NgxsUnhandledErrorHandler, NgxsUnhandledErrorContext } from '@ngxs/store';

@Injectable()
export class MyCustomNgxsUnhandledErrorHandler {
  handleError(error: any, unhandledErrorContext: NgxsUnhandledErrorContext): void {
    // Do something with these parameters
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: NgxsUnhandledErrorHandler,
      useClass: MyCustomNgxsUnhandledErrorHandler
    }
  ]
};
```

Note that the second parameter, `NgxsUnhandledErrorContext`, contains an object with an `action` property. This property holds the action that triggered the error while being processed.
