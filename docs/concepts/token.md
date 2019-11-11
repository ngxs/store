# State Token

Creates a state token that can be used a state as alias. When creating an StateToken, you can set a default state model type of the parameterized type `T`. This way you can ensure the type safety of your application.

- Improved typing for `@State`, `@Selector` in state class

```ts
interface TodoStateModel {
  title: string;
  completed: boolean;
}

const TODOS_STATE_TOKEN = StateToken.create<TodoStateModel[]>('todos');

@State({
  name: TODOS_STATE_TOKEN,
  defaults: [] // if you specify the wrong state type, will be a compilation error
})
class TodosState {
  @Selector(TODOS_STATE_TOKEN) // if you specify the wrong state type, will be a compilation error
  public static completedList(state: TodoStateModel[]): TodoStateModel[] {
    return state.filter(todo => todo.completed);
  }
}
```

Otherwise

```ts
const TODOS_STATE_TOKEN = StateToken.create<TodoStateModel[]>('todos');

@State({
  name: TODOS_STATE_TOKEN,
  defaults: {} // compilation error
})
class TodosState {
  @Selector([TODOS_STATE_TOKEN]) // compilation error
  public static completedList(state: string[]): string[] {
    return state;
  }
}
```

- Improved typing for `@Select`

```ts
@Component(/**/)
class AppComponent {
  @Select(TODOS_STATE_TOKEN) // if you specify the wrong state type, will be a compilation error
  public todos$: Observable<TodoStateModel[]>;
}
```

Otherwise

```ts
@Component(/**/)
class AppComponent {
  @Select(TODOS_STATE_TOKEN) // compilation error
  public todos$: Observable<string[]>;

  @Select(TODOS_STATE_TOKEN) // compilation error
  public todos: string;
}
```

- Improved typing for `store.select, store.selectOnce, store.selectSnapshot`

```ts
@Component(/**/)
class AppComponent implements OnInit {
  constructor(private store: Store) {}

  public ngOnInit(): void {
    this.store.selectSnaphot(TODOS_STATE_TOKEN); // expect type TodoStateModel[]
    this.store.select(TODOS_STATE_TOKEN); // expect type Observable<TodoStateModel[]>
    this.store.selectOnce(TODOS_STATE_TOKEN); // expect type Observable<TodoStateModel[]>
  }
}
```
