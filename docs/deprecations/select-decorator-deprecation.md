# Select Decorator Deprecation

The `@Select` decorator is slated for removal in the future due to its inherent risks. It lacks integration with Angular's dependency injection system, making it prone to failures in scenarios with multiple simultaneous applications, such as server-side rendering and microfrontend setups.

The decorator stores the `Store` instance in a static variable, which could be overwritten by subsequent bootstrapped or removed applications. If a second application was created and destroyed before the first one, it could nullify the static variable, rendering the store inaccessible to the first application. On the server, that same static keeps the request's `Store` (and its whole state graph) alive for the life of the process, so an app that doesn't use `@Select` still pays for it with a memory leak.

## `@Select` is no longer enabled by default

Because of the leak above, NGXS no longer creates the machinery `@Select` relies on unless you ask for it. If you can't migrate right away, opt in:

```ts
// standalone
provideStore([UsersState], withNgxsSelectDecoratorSupport());
```

```ts
// NgModule
@NgModule({
  imports: [NgxsModule.forRoot([UsersState]), NgxsSelectDecoratorSupportModule.forRoot()]
})
export class AppModule {}
```

Without it, reading a `@Select` property throws. Migrating off `@Select` is still the recommended path.

## Migrating away from `@Select`

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
