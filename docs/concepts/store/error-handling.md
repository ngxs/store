# Error Handling

## Handling errors after dispatching an action

If an unhandled exception is thrown inside an action, the error will be propagated to the `ErrorHandler` and you can also catch it by subscribing to the `dispatch` Observable. If you subscribe to the `dispatch` Observable the error will be caught twice, once in the ErrorHandler and on your `dispatch` handle.

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
    this.store
      .dispatch(new UnhandledError())
      .pipe(
        catchError(err => {
          console.log('unhandled error on dispatch subscription');
          return of('');
        })
      )
      .subscribe();
  }
}
```

It is recommended to handle errors within `@Action` and update the state to reflect the error, which you can later select to display where required.

You can play around with error handling in the following [stackblitz](https://stackblitz.com/edit/ngxs-error-handling)
