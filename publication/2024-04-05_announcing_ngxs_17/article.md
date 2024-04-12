# Announcing NGXS 17

NGXS v17 is the result of months of hard work by the team, who have been dedicated to ensuring that the library is stable and that its core features are enhanced, all while maintaining its simplicity.

## Overview

- 🎨 Standalone API
- 🚦 Signals
- ⏩ Dispatch Utilities
- 🚀 Schematics
- ❗ Error Handling
- 🔌 Plugin Improvements
- 🛑 Breaking Changes
- 🗑️ Deprecations
- 🧑🏾‍🤝‍🧑🏻 NGXS Community

---

## Standalone API

We have introduced a new, standalone API that is backward compatible with the old API. Here is a quick comparison of the two APIs:

_Before_

```ts
import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

@NgModule({
  imports: [
    NgxsModule.forRoot([TodosState], {
      developmentMode: !environment.production
    }),
    NgxsReduxDevtoolsPluginModule.forRoot({ disabled: environment.production })
  ]
})
export class AppModule {}
```

_After_

```ts
import { provideStore } from '@ngxs/store';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [TodosState],
      { developmentMode: !environment.production },
      withNgxsReduxDevtoolsPlugin({ disabled: environment.production })
    )
  ]
};
```

The `provideStore` function is the central hub for managing your NGXS Store. This is where you register your States, configure your NGXS store, and enable any plugins that you want to use.

All NGXS plugins follow the naming convention `withNgxs{name}Plugin`. For example, the plugin for logging state changes is called `withNgxsLoggerPlugin`.

Let's explore a comprehensive list of all the plugins and how to use them using modules and the standalone API.

| Plugin     | Module                                                            | Standalone                                              |
| :--------- | :---------------------------------------------------------------- | :------------------------------------------------------ |
| DevTools   | `NgxsReduxDevtoolsPluginModule.forRoot()`                         | `withNgxsReduxDevtoolsPlugin()`                         |
| Logger     | `NgxsLoggerPluginModule.forRoot()`                                | `withNgxsLoggerPlugin()`                                |
| Storage    | `NgxsStoragePluginModule.forRoot()`                               | `withNgxsStoragePlugin()`                               |
| Forms      | `NgxsFormPluginModule.forRoot()`                                  | `withNgxsFormPlugin()`                                  |
| Router     | `NgxsRouterPluginModule.forRoot()`                                | `withNgxsRouterPlugin()`                                |
| Web Socket | `NgxsWebsocketPluginModule.forRoot({url: 'ws://localhost:4200'})` | `withNgxsWebSocketPlugin({url: 'ws://localhost:4200'})` |

You can read more [here](https://www.ngxs.io/introduction/schematics)

### Development Options

NGXS provides a mechanism to detect actions that haven't been processed by any state in your application. This functionality is valuable for ensuring your actions are handled as expected and helps identify potential issues.

Previously, this feature was only accessible within applications built with modules. Now, NGXS offers it as a standalone API, making it even more versatile.

_Using Modules_

```ts
import { NgxsModule, NgxsDevelopmentModule } from '@ngxs/store';

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsDevelopmentModule.forRoot({
      warnOnUnhandledActions: true // <-- set this flag to 'true' will warn for any unhandled actions
    })
  ]
})
```

_Using Standalone API_

```ts
import { provideStore, withNgxsDevelopmentOptions } from '@ngxs/store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [],
      withNgxsDevelopmentOptions({
        warnOnUnhandledActions: true // <-- set this flag to 'true' will warn for any unhandled actions
      })
    )
  ]
};
```

---

## Signals

### selectSignal

We have also introduced the `selectSignal` function, which functions similarly to `select`, but instead of returning an observable, it returns a [signal](https://angular.io/guide/signals):

```ts
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-zoo',
  template: `
    @for (panda of pandas(); track $index) {
      <p>{{ panda }}</p>
    }
  `
})
export class ZooComponent {
  readonly pandas = this.store.selectSignal(ZooState.pandas);

  constructor(private store: Store) {}
}
```

The `selectSignal` function only accepts a 'typed' selector function (a function that carries type information) and a state token. For instance, providing an anonymous function like this wouldn't work:

```ts
store.selectSignal(state => state.animals.pandas);
```

We don't allow any options to be provided to the internal `computed` function, such as an equality function, because immutability is a fundamental premise for the existence of data in our state. Users should never have a reason to specify the equality comparison function.

### Signal Utilities

NGXS offers utilities for signals that can be used with other solutions, promoting modularity and flexibility. All of these utilities are located within the `@ngxs/store` package and are independent of any specific state management framework.

These utilities are:

- `select`: This utility function retrieves a signal from the state for the provided selector.
- `createSelectMap`: This utility function will convert an object where the values are selectors to an object where each property is the signal for the corresponding selector.

See the [select](https://www.ngxs.io/concepts/select/signals#select) and [createSelectMap](https://www.ngxs.io/concepts/select/signals#createselectmap) in the documentation for further details.

**NgRx SignalStore**

These utility functions can be easily integrated for use with the NgRx SignalStore solution

You can read more [here](https://www.ngxs.io/concepts/select/signals)

---

## Dispatch Utilities

- `dispatch`: This utility function takes an action as a parameter and returns a function. This function can then be called with parameters for the action constructor. When this function is called, the action is created and is dispatched immediately.
- `createDispatchMap`: This utility function accepts an object where the values are action classes

See the [dispatch](https://www.ngxs.io/concepts/store#dispatch-utility) and [createDispatchMap](https://www.ngxs.io/concepts/select/signals#createdispatchmap) in the documentation for further details.

## Schematics

NGXS is a popular state management library for Angular applications. It is known for its simplicity, but it can be challenging to get started with, especially for beginners.

NGXS schematics are a new feature that makes it easier to use NGXS by automating the installation, and creation of common NGXS concepts, such as Store, Actions, and State.

To auto-configure NGXS to your application, all you have to do is to execute the following command in your terminal:

```bash
ng add @ngxs/store
```

Does your workspace have multiple projects? No problem! You'll be prompted to select the project you want to add NGXS to.

NGXS plugins: We couldn't resist adding [plugins](https://www.ngxs.io/plugins) to the schematics. Now you can choose which plugins you want to use, and we'll install the necessary packages and configure them for you automatically!

> All the schematics support both non-standalone and standalone Angular apps.

Let's see some examples:

- To create a `Store` :

  ```bash
  ng generate @ngxs/store:store
  ```

  ```ts
  import { provideStore } from '@ngxs/store';

  export const appConfig: ApplicationConfig = {
    providers: [provideStore([], { developmentMode: !environment.production })]
  };
  ```

- To create a `State`:

  ```bash
  ng generate @ngxs/store:state --name TodosState
  ```

  ```ts
  import { provideStore } from '@ngxs/store';
  import { TodosState } from 'your/path';

  export const appConfig: ApplicationConfig = {
    providers: [
      provideStore(
        [TodosState], // <--
        { developmentMode: !environment.production }
      )
    ]
  };
  ```

- To create `Actions`:

  ```bash
  ng generate @ngxs/store:actions --name todos
  ```

  It will create the `todos.actions.ts` file

---

## Error Handling

NGXS provides a robust error handling mechanism that automatically catches unhandled exceptions thrown within actions. These errors are then directed to a centralized `ErrorHandler`.

However, you can override the default implementation and provide your custom one

You can read more [here](https://www.ngxs.io/concepts/store/error-handling#custom-unhandled-error-handler)

---

## Bug Fixes

- Show error when state initialization order is invalid [#2066](https://github.com/ngxs/store/pull/2066)

  When the `UpdateState` is dispatched before the `InitState` a `console.error` will appear, and the the state initialization order must be update. An incorrect order may prevent `ngxsOnInit` from being called on feature states or lead to other unpredictable errors.

- Log feature states added before store is initialized [#2067](https://github.com/ngxs/store/pull/2067)

  When a feature state is initialized before the `store`, will appear an error message and the state initialization order must be updated. This typically occurs when `NgxsModule.forFeature` or `provideStates` is called before `NgxsModule.forRoot` or `provideStore`.

---

## Plugin Improvements

The plugins exposes some of its internal API implementations to allow library authors to experiment with potential extensions. However, keep in mind that these API implementations are not part of the official API, but rather an internals API. This means that they could be changed at any time in the future. Let's see some of their details:

> _Please note the `barred O` symbol which denotes it's not part of the official API_

**Router Plugin**

The exposed tokens and function are:

- `ɵNGXS_ROUTER_PLUGIN_OPTIONS`
- `ɵUSER_OPTIONS`
- `ɵcreateRouterPluginOptions`

You can import them using this path `@ngxs/router-plugin/internals` as seen below:

---

**Storage Plugin**

The exposed tokens and function are:

- `ɵDEFAULT_STATE_KEY`

  The storage plugin's key [option](https://www.ngxs.io/plugins/storage#options) allows you to specify which state slices should be persisted in storage. If you don't provide any state names, the plugin will persist all states using the `@@STATE` key. You can now use the `ɵDEFAULT_STATE_KEY` token to provide an alternative to `@@STATE`.

- `ɵFINAL_NGXS_STORAGE_PLUGIN_OPTIONS`,
- `ɵNGXS_STORAGE_PLUGIN_OPTIONS`,
- `ɵextractStringKey`,
- `ɵisKeyWithExplicitEngine`,
- `ɵcreateFinalStoragePluginOptions`

  As of today, SSR apps can use custom storage engine implementations instead of relying on `localStorage` or `sessionStorage`.
  This new internal API gives you the flexibility to further customize your storage solution.

You can import them using this path `@ngxs/storage-plugin/internals`.

---

## Breaking Changes

### Storage Plugin

We're moving towards a more explicit approach. Now, you need to define exactly which states you want the **Storage Plugin** to serialize. This gives you finer control over what data gets persisted.

- **Explicit State Selection:** You now have granular control over which states get serialized by the **Storage Plugin**. Simply specify the states you want to save in the plugin options.

- **Serialize All States:** Don't worry, if you still prefer to serialize everything, there's an option for that too!

- **Feature State Support:** This update also opens the door to serializing feature states, providing a more comprehensive persistence solution.

As mentioned earlier, you can still configure the Storage Plugin to serialize all your application states. Here's an example of how to achieve this:

_Before_

```ts
import { NgxsModule } from '@ngxs/store';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';

@NgModule({
  imports: [NgxsStoragePluginModule.forRoot()]
})
export class AppModule {}
```

_After_

```ts
import { NgxsModule } from '@ngxs/store';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';

@NgModule({
  imports: [NgxsStoragePluginModule.forRoot({ keys: '*' })]
})
export class AppModule {}
```

Now that we've covered serializing all states, let's explore how to pick and choose which ones get saved. This approach offers greater control and potentially improves performance, especially for larger applications.

Here's an example of how to serialize specific states:

_Before_

```ts
import { NgxsModule } from '@ngxs/store';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';

@NgModule({
  imports: [NgxsStoragePluginModule.forRoot({ key: 'novels' })]
})
export class AppModule {}
```

_After_

```ts
import { NgxsModule } from '@ngxs/store';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';

@NgModule({
  imports: [NgxsStoragePluginModule.forRoot({ keys: ['novels'] })]
})
export class AppModule {}
```

✨ We understand that updating existing code can be time-consuming. To help with this transition, the Storage Plugin offers an automatic migration feature.

This means you won't have to manually update your code to reflect the changes. The migration command will handle that for you:

```bash
ng g @ngxs/storage-plugin:keys-migration
```

### Dispatch

In previous versions, the `dispatch` function incorrectly returned an `Observable<any>`. This meant the observable could emit any type of data, including the `state` snapshot. This behavior has been rectified in this version. Now, `dispatch` correctly returns an `Observable<void>`, indicating it does not emit any values.

To see an example, let's assume that we have the state as seen below:

```ts
@State<number>({
  name: 'number',
  defaults: 0
})
@Injectable()
class MyState {
  @Action(Add)
  add(ctx: StateContext<string>, { payload }: Add) {
    return of({}).pipe(tap(() => ctx.setState(ctx.getState() + payload)));
  }
}
```

_Before_

In a previous implementation we could access the state while subscribing.

```ts
store.dispatch(new Add(10)).subscribe(state => {
  // Access the state
  console.log(state.number); // this will log 10
});
```

_After_

In this version, directly accessing the state within a subscription is not supported. To retrieve the current state value, use the `store.snapshot()` method.

```ts
store.dispatch(new Add(10)).subscribe(() => {
  // Access the state via store.snapshot()
  console.log(store.snapshot().number); // this will log 10
});
```

### Throwing errors from selectors by default

In previous versions, errors encountered in selectors were silently ignored. This behavior has changed in this version. Now, errors will be thrown explicitly.

There's a distinction in how errors are thrown based on the selection method used:

- `selectSnapshot` will throw errors synchronously.
- Errors originating from `select` will be thrown asynchronously. This is because the `RxJS` error reporter utilizes a `setTimeout` function.

It's important to note that errors are still logged in development mode for debugging purposes.

### Enforcing Typed Selectors in store.select, store.selectOnce, and store.selectSnapshot

For improved type safety and maintainability, these selector functions now require typed selectors as arguments. This means raw state classes or anonymous functions are no longer accepted.

If your selectors are already typed, you don't need any modifications. For example, `this.store.selectSnapshot(CounterState.getState)` remains valid.

**Addressing Untyped Selectors:**

If you were using untyped selectors like `this.store.selectSnapshot(CounterState)`, you have two options:

1. **State Tokens**: Utilize state tokens for improved type safety. Here's an example:

   ```ts
   // Define a state token for CounterState
   export const COUNTER_STATE_TOKEN = new StateToken<number>('counter');

   // Update CounterState to use the token
   @State<number>({
     name: COUNTER_STATE_TOKEN, // Use the token instead of 'counter'
     defaults: 0
   })
   @Injectable()
   class CounterState {}
   ```

   With this change, your selector becomes:

   ```ts
   this.store.selectSnapshot(COUNTER_STATE_TOKEN);
   ```

2. **Typed Selectors**: Alternatively, create a typed selector that returns the state itself. Here's an example:

   2.a Using the createSelector util

   ```ts
   export namespace CounterQueries {
     export const getState = createSelector([CounterState], (state: number) => state);
   }
   ```

   With this approach, your selector becomes:

   ```ts
   this.store.selectSnapshot(CounterQueries.getState);
   ```

   2.b Using the deprecated @Selector decorator

   ```ts
   @State<number>({
     name: COUNTER_STATE_TOKEN, // Use the token instead of 'counter'
     defaults: 0
   })
   @Injectable()
   class CounterState {
     @Selector()
     static getState(state: Todo[]) {
       return state;
     }
   }
   ```

   With this approach, your selector becomes:

   ```ts
   this.store.selectSnapshot(CounterState.getState);
   ```

### Container state is not injected by default

In selectors decorated with `@Selector()`, the behavior depends on whether parameters are provided:

- **No Parameters**: Without any parameters, the selector relies implicitly on the state container. Any change to the state container will trigger a recalculation of the selector's value. This can be inefficient if the selector doesn't directly use the entire state container.

  > There is no breaking change in this behavior.

  ```ts
  @State<NotificationModel>({
    name: 'notifications'
  })
  class NotificationsState {
    @Selector()
    static getNotifications(state: NotificationsStateModel) {
      return state.notifications;
    }
  }
  ```

- **Parameters**: When you specify selector functions (`selectorFn1`, `selectorFn2`, etc.) as parameters to `@Selector()`, the selector only recalculates when one of those specific functions changes. This provides more granular control and avoids unnecessary recalculations.

  In previous versions the State Container was injected as first argument in the selector function and the selector was recalculated on any state change.

  > This is a breaking change.

  _Before_

  ```ts
  @State<NotificationModel>({
    name: 'notifications'
  })
  class NotificationsState {
    @Selector([NotificationsState.getNotifications])
    static getUnreadTotal(state: NotificationsStateModel, notifications: Notification[]) {
      return notifications.reduce(() => ..., 0);
    }
  }
  ```

  _After_\*

  ```ts
  @State<NotificationModel>({
    name: 'notifications'
  })
  class NotificationsState {
    @Selector([NotificationsState.getNotifications])
    static getUnreadTotal(notifications: Notification[]) { // Note that the first argument isn't the State Container
      return notifications.reduce(() => ..., 0);
    }
  }
  ```

---

## Deprecations

### Select Decorator

The `@Select` decorator is slated for removal in the future due to its inherent risks. It lacks integration with Angular's dependency injection system, making it prone to failures in scenarios with multiple simultaneous applications, such as server-side rendering and microfrontend setups.

You can read more [here](https://www.ngxs.io/deprecations/select-decorator-deprecation)

### Sub States

We're planning to remove the option to declare sub-states on the state using the `children` property. This feature was introduced years ago to address certain issues, but it's not technically beneficial and doesn't add any value.

You can read more [here](https://www.ngxs.io/deprecations/sub-states-deprecation)

---

## NGXS Community

NGXS on Discord? Heck yes! Join the party and level up your development skills together. Let's keep the conversation flowing! https://discord.gg/yFk6bu7v
