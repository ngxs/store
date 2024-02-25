# Error Handling

## Handling errors within an `@Action`

When you define an @Action you can handle error within the action and if you do so, the error will not propagate to Angular's global `ErrorHandler`, nor the `dispatch` Observable. This applies to both sync and async types of Actions.

```ts
class AppState {
  @Action(HandledError)
  handledError(ctx: StateContext<StateModel>) {
    try {
      // error is thrown
    } catch (err) {
      console.log(
        'error catched inside @Action wont propagate to ErrorHandler or dispatch subscription'
      );
    }
  }
}
```
