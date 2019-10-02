# Meta Reducer
A meta reducer is a higher order reducer that allows you to
take action on the global state rather than a state slice.
In NGXS, we don't have this concept but you can accomplish
this with [plugins](../plugins/intro.md).

An example of a meta reducer might be to clear the entire
state when a user logs out. An example implementation would be:

```TS
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

Then we import that like:

```TS
import { NgModule } from '@angular/core';
import { NGXS_PLUGINS } from '@ngxs/store';

@NgModule({
  imports: [NgxsModule.forRoot([])],
  providers: [
    {
      provide: NGXS_PLUGINS,
      useValue: logoutPlugin,
      multi: true
    }
  ]
})
export class AppModule {}
```

Now when we dispatch the logout action it will use our new
plugin and erase the state.
