# Meta Reducers

A meta reducer is a higher order reducer that allows you to take action on the global state rather than a state slice. In NGXS, we don't have this concept but you can accomplish this with [plugins](broken-reference).

An example of a meta reducer might be to clear the entire state when a user logs out. An example implementation would be:

```ts
import { getActionTypeFromInstance } from '@ngxs/store';

export function logoutPlugin(state, action, next) {
  // Use the get action type helper to determine the type
  if (getActionTypeFromInstance(action) === Logout.type) {
    // if we are a logout type, lets erase all the state
    state = {};
  }

  // return the next function with the empty state
  return next(state, action);
}
```

Then add it to `provideStore` features:

```ts
import { provideStore, withNgxsPlugin } from '@ngxs/store';

export const appConfig: ApplicationConfig = {
  providers: [provideStore([], withNgxsPlugin(logoutPlugin))]
};
```

Now when we dispatch the logout action it will use our new plugin and erase the state.
