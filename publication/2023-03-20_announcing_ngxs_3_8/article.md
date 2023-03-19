# Announcing NGXS 3.8

(Intro)

## Overview

- 🚀 Packaging in Angular Ivy format
- 🚀 Advanced selector utils
- 🎨 Expose `ActionContext` and `ActionStatus`
- 🎨 Strong typing for `ofAction*` operators
- 🎯 Better typing for state operators
- 🚀 Monitoring Unhandled Actions
- 🐛 Bug Fixes
- 🔌 Plugin Improvements
- 🔬 NGXS Labs Projects Updates

---

## Packaging in Angular Ivy format

(Introduction [with problem statement], details and usage)

## Advanced selector utils

Generating simple selectors for each property of the state model can be a time-consuming and repetitive task. The purpose of selector utils is to simplify this process by providing tools to create selectors effortlessly, merge selectors from various states, and generate a selector for a particular subset of state properties. Three new functions have been added to the `@ngxs/store` package.

To illustrate the usage of these functions, let's assume that we have the following states:

```ts
export interface TodoStateModel {
  todos: Todo[];
  loading: boolean;
  error: any;
}

@State<TodoStateModel>({
  name: 'todos',
  defaults: {
    todos: [],
    loading: false,
    error: null
  }
})
@Injectable()
export class TodoState {}
```

```ts
export interface AuthStateModel {
  user: User;
  loading: boolean;
  error: any;
}

@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    user: null,
    loading: false,
    error: null
  }
})
@Injectable()
export class AuthState {}
```

### Create Property Selectors

It is a common need to have to create a selectors for each property of the state model. This can be annoying and repetitive. The createPropertySelectors function simplifies this process by generating a selector for each property of the state model. cThe selector returns the value of the corresponding property. Let's compare the code before and after using the createPropertySelectors function for the TodoState.

- Before:

```ts
export class TodoSelectors {
  @Selector(TodoState)
  static todos(state: TodoStateModel) {
    return state.todos;
  }

  @Selector(TodoState)
  static loading(state: TodoStateModel) {
    return state.loading;
  }

  @Selector(TodoState)
  static error(state: TodoStateModel) {
    return state.error;
  }
}
```

- After:

```ts
export class TodoSelectors {
  static props = createPropertySelectors<TodoStateModel>(TodoState);
}
```

The generated selectors are available under the `props` property of the `TodoSelectors` class. The `props` property is an object that contains the selectors for each property of the state model. The selectors can be accessed using the property name. Below is an example of how to use the generated selectors.

```ts
const todos$ = this.store.select(TodoSelectors.props.todos);
const loading$ = this.store.select(TodoSelectors.props.loading);
const error$ = this.store.select(TodoSelectors.props.error);
```

### Create Model Selector

When an application grows, it is common to have multiple states. In this case, it is useful to have a selector that returns a model that is composed from values returned by multiple selectors. The createModelSelector function simplifies this process by generating a selector that returns a model composed from values returned by multiple selectors. Below is an example of how to use the createModelSelector function to combine the TodoState and AuthState.

```ts
export class TodoSelectors {
  static props = createPropertySelectors<TodoStateModel>(TodoState);

  static selectTodoViewModel = createModelSelector({
    todos: TodoSelectors.props.todos,
    loading: TodoSelectors.props.loading,
    user: AuthSelectors.authProps.user
  });
```

This selector returns an object that contains the values returned by the specified selectors. The selector will be re-evaluated when any of the specified selectors returns a new value. The best use case for this selector is when you want to combine the values returned by multiple selectors into a view model.

### Create Pick Selector

This function creates a selector that returns a subset of the state model. The createPickSelector selector has a distinct advantage over a custom-built selector that creates a truncated object from the given selector. It only generates a new value when there is a modification in the chosen property, and ignores any changes to other properties. This makes it an ideal solution for those who prioritize Angular change detection performance.

```ts
export class TodoSelectors {
  static selectTodoViewModel = createPickSelector(TodoState, ['todos', 'loading']);
}
```

## Expose `ActionContext` and `ActionStatus`

> > TODO

## Strong typing for `ofAction*` operators

> > TODO

## Better typing for state operators

The type of a state operator is not inferred from the contextual requirement of the State Operator on it's return type.
The typescript default of inferring the type of T from the arguments of the operator has been blocked so that it allows for this "reverse" inference. As a result of this change, both type checking and IntelliSense work as originally intended.

Note that this could be a breaking change for some users, as the type of the state operator is now inferred from the return type of the operator, instead of the arguments. However, this change is necessary to make the type of the state operator more predictable.

## Monitoring Unhandled Actions

During development it is useful to know when an action is dispatched but not handled by any of the registered handlers. This can happen when an action is dispatched but no state has been registered to handle it, or when an action is dispatched but the handler is not registered for the current state. The `@ngxs/store` package provides a new option that allows you to monitor unhandled actions. This option is disabled by default, but you can enable it by including the module NgxsDevelopmentModule in your application.

```ts
@NgModule({
  imports: [NgxsModule.forRoot([CounterState]), NgxsDevelopmentModule.forRoot()]
})
export class AppModule {}
```

When the option is enabled, a warning message will be logged to the console when an action is dispatched but not handled by any of the registered handlers. The warning message shown in the console contains the name of the action.

It is possible to ignore Actions that should not be logged. For example, the `@ngxs/router-plugin` package dispatches the `RouterNavigation` action when the router navigates to a new URL. In order to avoid unnecessary warnings, the `@ngxs/store` package provides a way to ignore these actions. You can ignore an action by passing an array to the `ignore` option in `warnOnUnhandledActions`. The array contains the actions to ignore. Below is an example of how to ignore the `RouterNavigation` action.

```ts
@NgModule({
  imports: [
    NgxsModule.forRoot([CounterState]),
    NgxsRouterPluginModule.forRoot(),
    NgxsDevelopmentModule.forRoot({ warnOnUnhandledActions: { ignore: [RouterNavigation] } })
  ]
})
```

## Bug Fixes

###

## Plugin Improvements

### Router Plugin

#### Feature: Provide more actions and navigation timing [#1932](https://github.com/ngxs/store/pull/1932)

Two new actions have been added to the router plugin:

`RouterRequested` and `RouterNavigated`. These actions are dispatched when the navigation starts and after the navigation successfully finishes, respectively. This allows you to perform some logic before and after the navigation.

In addition to these new actions, a new options has been added to the router plugin: `navigationTiming`. This option allows you to choose when the `RouterNavigation` action is dispatched. The default value is `NavigationTiming.PreActivation`, which means that the `RouterNavigation` action is dispatched before the navigation has been completed. This can cause problems in case the navigation is cancelled or redirected, for example, by a guard.
If you set this option to `NavigationTiming.PostActivation`, the `RouterNavigation` action will be dispatched after all guards and resolvers.

Here is how you can set the `navigationTiming` option:

```ts
import { NgxsModule } from '@ngxs/store';
import { NgxsRouterPluginModule, NavigationActionTiming } from '@ngxs/router-plugin';
@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsRouterPluginModule.forRoot({
      navigationActionTiming: NavigationActionTiming.PostActivation
    })
  ]
})
export class AppModule {}
```

### Storage Plugin

#### Feature: Allow providing namespace for keys [#1841](https://github.com/ngxs/store/pull/1841)

The storage plugin now allows you to provide a `namespace` for the keys that are used to store the state in the storage. This is useful if you have multiple applications that share the same storage. This is specially necessary when building micro-frontend applications.

Here is how you can set the `namespace` option:

```ts
@NgModule({
  imports: [
    NgxsStoragePluginModule.forRoot({
      namespace: 'auth'
    })
  ]
})
export class AppModule {}
```

#### Feature: Enable providing storage engine individually [#1935](https://github.com/ngxs/store/pull/1935)

The storage plugin now allows you to provide the storage engine individually. This is useful if you want to use a different storage engine for each state. For example if we want to use `localStorage` for the `auth` state and `sessionStorage` for the `users` state, the following configuration could be used:

```ts
import { LOCAL_STORAGE_ENGINE, SESSION_STORAGE_ENGINE } from '@ngxs/storage-plugin';
@NgModule({
  imports: [
    NgxsStoragePluginModule.forRoot({
      key: [
        {
          key: 'auth', // or `AuthState`
          engine: LOCAL_STORAGE_ENGINE
        },
        {
          key: UsersState, // or `users`
          engine: SESSION_STORAGE_ENGINE
        }
      ]
    })
  ]
})
export class AppModule {}
```

Note that `LOCAL_STORAGE_ENGINE` and `SESSION_STORAGE_ENGINE` are provided by the storage plugin and will resolve to the `localStorage` and `sessionStorage`, respectively. When building SSR applications, these tokens will resolve to `null`, in this case a custom storage engine should be provided.

### Devtools Plugin

#### Feature: New options added to `NgxsDevtoolsOptions` [#1879](https://github.com/ngxs/store/pull/1879)[#1968](https://github.com/ngxs/store/pull/1968)

The devtools plugin now allows you to provide the following options:

- `latency`: If more than one action is dispatched in the indicated interval, all new actions will be collected and sent at once.
  It is the joint between performance and speed. When set to 0, all actions will be sent instantly.
  Set it to a higher value when experiencing perf issues (also maxAge to a lower value). Default is 500 ms.
- `actionsBlacklist`: string or array of strings as regex - actions types to be hidden in the monitors (while passed to the reducers).
  If actionsWhitelist specified, actionsBlacklist is ignored.
- `actionsWhitelist`: string or array of strings as regex - actions types to be shown in the monitors (while passed to the reducers).
  If actionsWhitelist specified, actionsBlacklist is ignored.
- `predicate`: called for every action before sending, takes state and action object, and
  returns true in case it allows sending the current data to the monitor.
  Use it as a more advanced version of actionsBlacklist/actionsWhitelist parameters
- `trace`: if set to `true`, will include stack trace for every dispatched action, so you can see it in trace tab jumping directly to that part of code
- `traceLimit`: maximum stack trace frames to be stored (in case trace option was provided as true)

---

## NGXS Labs Projects Updates

### New Labs Project: @ngxs-labs/...

...

### Labs Project Updates: @ngxs-labs/...

...

---

## Some Useful Links

> > Add discord link

If you would like any further information on changes in this release please feel free to have a look at our changelog. The code for NGXS is all available at https://github.com/ngxs/store and our docs are available at http://ngxs.io/. We have a thriving community on our slack channel so come and join us to keep abreast of the latest developments. Here is the slack invitation link: https://join.slack.com/t/ngxs/shared_invite/zt-by26i24h-2CC5~vqwNCiZa~RRibh60Q
