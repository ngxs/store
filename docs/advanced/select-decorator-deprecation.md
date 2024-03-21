# Select Decorator Deprecation

The `@Select` decorator is slated for removal in the future due to its inherent risks. It lacks integration with Angular's dependency injection system, making it prone to failures in scenarios with multiple simultaneous applications, such as server-side rendering and microfrontend setups.

Previously, the decorator stored the `Store` instance in a static variable, which could be overwritten by subsequent bootstrapped or removed applications. If a second application was created and destroyed before the first one, it could nullify the static variable, rendering the store inaccessible to the first application.

Every `@Select` usage should be replaced with the following:

```ts
class UsersComponent {
  @Select(UsersState.getUsers) users$!: Observable<User[]>;

  // Should become the following
  users$: Observable<User[]> = inject(Store).select(UsersState.getUsers);
}
```

The `store.select` method now requires a typed selector to be provided. Therefore, if the `@Select` decorator previously accepted a string or an anonymous function, it should be replaced with a selector:

```ts
class UsersComponent {
  @Select('users') users$!: Observable<User[]>;
  // Or
  @Select(state => state.users) users$!: Observable<User[]>;

  // Should become the following
  users$: Observable<User[]> = inject(Store).select(UsersState.getUsers);
}
```

We could potentially provide a schematic migration that simply replaces the code. However, since the select decorator was permitted to be used inside classes not created by Angular dependency injection, our code replacement approach could still be flawed.
