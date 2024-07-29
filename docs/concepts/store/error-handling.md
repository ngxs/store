# Error Handling

## Deterministic vs Non-deterministic

Firstly, it is good to understand that your error handling approach should consider two different classes of error: Deterministic and Non-deterministic errors.

### Deterministic errors:

- These are repeatable errors that you would expect during the normal course of operation of your application.
- The condition for this error to happen is fully determined by the state of the application (hence the word "deterministic").
- `Determinism` is the property that you will always get the same output given the same input.
- If the application's data remains unchanged, then an erroring operation will always fail, no matter how many times it is retried.
- You should consider how your code should handle these errors as part of building a robust application.
- Some example approaches (from the 4xx HTTP status codes):
  - Bad request (400): The data that you are sending is in the incorrect format, something definitely needs to change with what you are sending.
  - Not Found (404): The requested item is not found, so you need to make a decision on how to respond to this scenario.

### Non-deterministic errors:

- These are errors generally occur as a result of the environment within which your application operates. For example, the network or a server failure could cause this type of error.
- Because this type of error lacks `Determinism` (see definition above), then it is possible that retrying the operation could lead to success. It is recommended to decide on a retry strategy that makes sense for the application experience that you wish to offer.
- Some example approaches (from the 5xx HTTP status codes - "server-side" errors ):
  - Internal Server Error (500): Something went wrong with the server. Things could succeed on retry, but it really depends on how resilient your server side is. Not recommended to retry for too long because this type of error could take more than a negligible time to resolve.
  - Gateway Timeout (504): There is a connection timeout, so it may be a good idea to check if there is network availability before retrying too many times.

## Recommended Approach in NGXS

It is recommended to handle errors within your `@Action` function in your state:

### Deterministic errors:

- `Update the state` to capture the error details
  - Ensure that the relevant selectors cater for these error states and provide information for your user to respond to the error accordingly
- OR `dispatch` an action that sends the error details to the necessary state or service
  - This action could be picked up by an application level error state or could be picked up by a service that is listening to the action stream (see [Action Handlers](../actions/action-handlers.md))

### Non-deterministic errors:

- Respond to the error accordingly(retry, abort, etc.)
- AND use one of the deterministic error handling mechanisms above to inform your user about the situation

## Fallback Error Handling

NGXS has a robost and predictable fallback mechanism for error handling. Although it is not recommended, some developers use these to tailor their application design to suit their team's preference.

Error handling firstly falls back to any error handler at the `dispatch` call and then to the `NgxsUnhandledErrorHandler`.

### Handling at the `dispatch` call

To manually catch an error thrown and not handled by an action, you can subscribe to the observable returned by the `dispatch` call and include an `error` callback. By subscribing and providing an `error` callback, NGXS won't pass the error to its final unhandled error handler.

You can include this error callback in three ways:

- by explicitly supplying the `error` callback in your `subscribe` function call
- by using one of the `rjxs` error handling operators
- by converting the observable into a promise and using any standard `async` or `promise` error handling mechanisms

Check this [special note](#ngxs-error-handling-detection-in-observables) if you have custom code that modifies rxjs's default error fallbacks.

#### Example

Given the following code:

```ts
class AppState {
  @Action(ActionThatCausesAnError)
  unhandledError(ctx: StateContext<StateModel>) {
    // error is thrown
  }
}
```

```ts
import { lastValueFrom } from 'rxjs';

class AppComponent {
  //...
  handleError() {
    this.store.dispatch(new ActionThatCausesAnError()).subscribe({
      error: error => {
        console.log('unhandled error on dispatch subscription: ', error);
      }
    });
  }

  async handleErrorAsync() {
    try {
      await latestValueFrom(this.store.dispatch(new ActionThatCausesAnError()));
    } catch (error) {
      console.log('unhandled error on dispatch caught: ', error);
    }
  }
}
```

You can play around with error handling in the following [stackblitz](https://stackblitz.com/edit/ngxs-error-handling)

### The `NgxsUnhandledErrorHandler`

The final level of fallback in NGXS will pass the error to the `NgxsUnhandledErrorHandler`. The default implementation of this service will pass the error on to the Angular `ErrorHandler` that is configured in the application.

The application developer can choose to provide a custom `NgxsUnhandledErrorHandler` to direct the error as they see fit.

#### Overriding the `NgxsUnhandledErrorHandler`

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

## Special Notes

### NGXS Error Handling Detection in Observables

In order to acheive the detection of `dispatch` call error handling, NGXS configures the RxJS [`onUnhandledError`](https://rxjs.dev/api/index/interface/GlobalConfig#onUnhandledError) callback. This property is accessible in RxJS versions 7 and above, which is why NGXS mandates a minimum RxJS version of 7.

The RxJS `onUnhandledError` callback triggers whenever an unhandled error occurs within an observable and no `error` callback has been supplied.

:warning: If you configure `onUnhandledError` after NGXS has loaded, you will need to store the existing implementation in a local variable and invoke it when the error is not handled by your customized rxjs error strategy:

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
