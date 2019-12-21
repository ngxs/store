# State Token

A state token can be used as a representation of a state class without referring directly to the state class itself. When creating an StateToken you will provide the location that the state should be stored on your state tree. You can also set a default state model type of the parameterized type `T`, which can assist with ensuring the type safety of referring to your state in your application. The state token is declared as follows:

```ts
const TODOS_STATE_TOKEN = new StateToken<TodoStateModel[]>('todos');
```

Or if you choose to not expose the model of your state class to the rest of the application then you can pass the type as `unknown` or `any`(this is useful if you want to keep all knowledge of the structure of your state class model private).

```ts
const TODOS_STATE_TOKEN = new StateToken<unknown>('todos');
```

If you use pass this token as the `name` property in your `@State` declaration (or if the path specified matches your `name` property then you can use this token to refer to this state class from other parts of your application (in your selectors, or in plugins like the storage plugin that need to refer to a state class). The token can be used in your `@State` declaration as follows:

```ts
interface TodoStateModel {
  title: string;
  completed: boolean;
}

const TODOS_STATE_TOKEN = new StateToken<TodoStateModel[]>('todos');

// Note: the @State model type is inferred from in your token.
@State({
  name: TODOS_STATE_TOKEN,
  defaults: []
})
class TodosState {
  // ...
}
```

A state token with a model type provided can be used in other parts of your application to improve type safety in the following aspects:

- Improved type checking for `@State`, `@Selector` in a state class

```ts
interface TodoStateModel {
  title: string;
  completed: boolean;
}

const TODOS_STATE_TOKEN = new StateToken<TodoStateModel[]>('todos');

@State({
  name: TODOS_STATE_TOKEN,
  defaults: [] // if you specify the wrong state type, will be a compilation error
})
class TodosState {
  @Selector([TODOS_STATE_TOKEN]) // if you specify the wrong state type, will be a compilation error
  static completedList(state: TodoStateModel[]): TodoStateModel[] {
    return state.filter(todo => todo.completed);
  }
}
```

The following code demonstrates mismatched types that will be picked up as compilation errors:

```ts
const TODOS_STATE_TOKEN = new StateToken<TodoStateModel[]>('todos');

@State({
  name: TODOS_STATE_TOKEN,
  defaults: {} // compilation error - array was expected, inferred from the token type
})
class TodosState {
  @Selector([TODOS_STATE_TOKEN]) // compilation error - TodoStateModel[] does not match string[]
  static completedList(state: string[]): string[] {
    return state;
  }
}
```

- Improved type checking for `@Select`

```ts
@Component(/**/)
class AppComponent {
  @Select(TODOS_STATE_TOKEN) // if you specify the wrong property type, there will be a compilation error
  todos$: Observable<TodoStateModel[]>;
}
```

The following code demonstrates mismatched types that will be picked up as compilation errors:

```ts
@Component(/**/)
class AppComponent {
  @Select(TODOS_STATE_TOKEN) // compilation error
  todos$: Observable<string[]>;

  @Select(TODOS_STATE_TOKEN) // compilation error
  todos: string;
}
```

- Improved type inference for `store.select, store.selectOnce, store.selectSnapshot`

```ts
@Component(/**/)
class AppComponent implements OnInit {
  constructor(private store: Store) {}

  ngOnInit(): void {
    const todos = this.store.selectSnaphot(TODOS_STATE_TOKEN); // infers type TodoStateModel[]
    const todos$ = this.store.select(TODOS_STATE_TOKEN); // infers type Observable<TodoStateModel[]>
    const oneTodos$ = this.store.selectOnce(TODOS_STATE_TOKEN); // infers type Observable<TodoStateModel[]>
  }
}
```
