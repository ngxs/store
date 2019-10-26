# Announcing NGXS 3.6

(Intro)

## Overview

- 💥 New lifecycle hook `ngxsOnChanges`
- 💦 Fixed Actions Stream Subscriptions Leak
- 🚧 Improved type safety for children states
- 🧤 Expose StateContextFactory, StateFactory
- ...
- 🐛 Bug Fixes
- 🔌 Plugin Improvements and Fixes
- 🔬 NGXS Labs Projects Updates

---

## 💥 New lifecycle hook `ngxsOnChanges`

We have added a new lifecycle hook. It was inspired by the `onChanges` hook available in Angular. It was a very simple change that enabled us to add this hook and it opens the opportunity for soem really great use cases. The new hook looks like this:

```ts
@State({ .. })
class MyState implements NgxsOnChanges {
  public ngxsOnChanges(change: NgxsSimpleChange): void {
    // ..
  }
}
```

The method receives a `NgxsSimpleChanges` object that contains the current and previous property values as well as a flag to tell you if this is the first change.

```ts
export class NgxsSimpleChange<T = any> {
  constructor(
    public readonly previousValue: T,
    public readonly currentValue: T,
    public readonly firstChange: boolean
  ) {}
}
```

This new hook is very convenient if we want to dispatch any additional actions or respond in any way after any fields within that part of the state have changed.

#### Lifecycle sequence

After creating the state by calling its constructor, NGXS calls the lifecycle hook methods in the following sequence at specific moments:

| Hook                 | Purpose and Timing                                                        |
| -------------------- | ------------------------------------------------------------------------- |
| ngxsOnChanges()      | Called before ngxsOnInit() and whenever state change.                     |
| ngxsOnInit()         | Called once, after the first ngxsOnChanges().                             |
| ngxsAfterBootstrap() | Called once, after the root view and all its children have been rendered. |

#### Here are a couple of example use cases:

I. A convenient way to track state changes:

_Before_

```ts
@State({ .. })
class MyState {}

@Component({ })
class MyComponent {
  constructor(store: Store) {
    store.select(MyState).subscribe((newState) => {
       console.log('state is changed', newState);
    })
  }
}
```

One of the problems is that if we are not using the `@ngxs/logger-plugin` or `@ngxs/devtools-plugin`, then we do not know what the previous state was before our state changed. It's great to have such an opportunity out of the box for quick, simple and focused debugging.

_After_

```ts
@State({ .. })
class MyState implements NgxsOnChanges {
  public ngxsOnChanges({ previousValue, currentValue }: NgxsSimpleChange): void {
    console.log('MyState has changed', previousValue, currentValue);
  }
}
```

Nice!

II. Convenient to synchronize with the server

Sometimes we need to save state on the server every time the client makes changes to it.

_Before_

```ts
@State({ .. })
class MyState {}

@Component({})
class MyComponent {
  constructor(store: Store, api: ApiService) {
    store.select(MyState).subscribe(async newState => {
      await api.save(newState);
    });
  }
}
```

_After_

```ts
@State({ .. })
class MyState implements NgxsOnChanges {
  constructor(api: ApiService) {}
  public async ngxsOnChanges(change: NgxsSimpleChange): void {
    await api.save(change.currentValue);
  }
}
```

III. You can write your own custom logger without another plugins

```ts
@State({ .. })
class MyState implements NgxsOnChanges {
  public ngxsOnChanges({ previousValue, currentValue }: NgxsSimpleChange): void {
    console.log('prev state', previousValue);
    console.log('next state', currentValue);
  }
}
```

## 💦 Fixed Actions Stream Subscriptions Leak

[#1381](https://github.com/ngxs/store/pull/1381)
(Introduction [with problem statement], details and usage)

## 🚧 Improved type safety for children states

_Before_

```ts
function MyChildState() {}

@State({
  name: 'myState',
  children: [MyChildState, { name: 'myChildOtherState' }, null] // success compile
})
class MyState {}
```

_After_

```ts
function MyChildState() {}

@State({
  name: 'myState',
  children: [MyChildState, { name: 'myChildOtherState' }, null] // failed compile, need uses only state class reference
})
class MyState {}
```

## 🧤 Expose StateContextFactory, StateFactory

Now if you want to have access to the internal core of NGXS state machine in your plugins you can use tokens `NGXS_STATE_FACTORY`, `NGXS_STATE_CONTEXT_FACTORY`.

```ts
import { NGXS_STATE_FACTORY, NGXS_STATE_CONTEXT_FACTORY } from '@ngxs/store/internals';

class MyPluginAccessor {
  constructor(
    @Inject(NGXS_STATE_FACTORY)
    public factory: any,
    @Inject(NGXS_STATE_CONTEXT_FACTORY)
    public contextFactory: any
  ) {}
}

@NgModule()
class MyPluginModule {
  public static forRoot(): ModuleWithProviders<MyPluginModule> {
    return {
      ngModule: MyPluginModule,
      providers: [MyPluginAccessor]
    };
  }
}

@NgModule({
  imports: [NgxsModule.forRoot(), MyPluginModule.forRoot()]
})
export class AppModule {}
```

## 🐛 Bug Fixes

For Each:
(Introduction, details and usage)

- Fix: Explicit typings for state operators [#1395](https://github.com/ngxs/store/pull/1395), [#1405](https://github.com/ngxs/store/pull/1405)
- Fix: Warn if the zone is not actual "NgZone" [#1270](https://github.com/ngxs/store/pull/1270)
- Fix: Do not re-throw error to the global handler if custom is provided [#1379](https://github.com/ngxs/store/pull/1379)
- Fix: Upgrade ng-packagr to fix Ivy issues [#1397](https://github.com/ngxs/store/pull/1397)

## 🔌 Plugin Improvements and Fixes

### HMR Plugin

- Feature: HMR Plugin - Add option for persisting state after the root module is disposed [#1369](https://github.com/ngxs/store/pull/1369)

If you make any changes to state in your application during the `ngOnDestroy` Angular lifecycle hook on any of your primary application components then it those changes may have missed the opportunity to be saved for Hot Module Reloading:

```ts
@Component({ .. })
class AppComponent implements OnDestroy {
 ...
 public ngOnDestroy(): void {
   this.store.reset({ .. }); // These changes will not be remembered by HMR
 }
}
```

Up until now there hasn't really been any way to work around this...
Now you can easily control this situation by turning on the flag `persistAfterDestroy`. This will cause the state as it existed after the `ngOnDestroy` hook to be persisted and restored by the HMR plugin.

```ts
if (environment.hmr) {
  import('@ngxs/hmr-plugin').then(plugin => {
    plugin
      .hmr(module, bootstrap, { persistAfterDestroy: true })
      .catch((err: Error) => console.error(err));
  });
} else {
  bootstrap().catch((err: Error) => console.error(err));
}
```

PS. It is recommended to use dynamic imports for the HMR plugin as you see above for improved tree-shaking.

### Storage Plugin

- Feature: Storage Plugin - Use state classes as keys [#1380](https://github.com/ngxs/store/pull/1380)

Currently, if you want a specific part of the state of the application to be stored then you have to provide the `path` of the state to the storage plugin. Now we have added the ability to provide the State Class instead of the path. As an example, given the following state:

```ts
@State<Novel[]>({
  name: 'novels',
  defaults: []
})
export class NovelsState {}
```

We would previously have to use the `path` of the state:

```ts
@NgModule({
  imports: [
    NgxsStoragePluginModule.forRoot({
      key: 'novels'
    })
  ]
})
export class AppModule {}
```

Now you can use the State Class:

```ts
@NgModule({
  imports: [
    NgxsStoragePluginModule.forRoot({
      key: NovelsState
    })
  ]
})
export class AppModule {}
```

This is a great improvement because it removes the requirement for you to provide the `path` of a state in multiple places in your application (with the risk of getting out of sync if there are any changes to the `path`). Now you just need to pass the reference to the state class and the plugin will automatically translate it to the `path`.

### Form Plugin

- Feature: Form Plugin - Implement `propertyPath` parameter in the `UpdateFormValue` [#1215](https://github.com/ngxs/store/pull/1215)

### WebSocket Plugin

- Feature: WebSocket Plugin - Implement `WebSocketConnected` action [#1371](https://github.com/ngxs/store/pull/1371)

---

## 🔬 NGXS Labs Projects Updates

### Labs project `@ngxs-labs/data` created

Announcing [@ngxs-labs/data](https://github.com/ngxs-labs/data)

#### Problem Statement:

The main problem is that with the large growth of the application, the number Action classes.

```ts
export interface Book {
  id: string;
  volumeInfo: any;
}

export class SearchAction {
  static readonly type = '[Book] Search';

  constructor(public payload: string) {}
}

export class SearchCompleteAction {
  static readonly type = '[Book] Search Complete';

  constructor(public payload: Book[]) {}
}

export class AddAction {
  static readonly type = '[Book] add';

  constructor(public payload: Book) {}
}

export class SelectAction {
  static readonly type = '[Book] Select';

  constructor(public payload: string) {}
}

export interface BookEntities {
  [id: string]: Book;
}

export interface BookEntitiesModel {
  ids: string[];
  entities: BookEntities;
  selectedBookId: string;
}

@State<BookEntitiesModel>({
  name: 'book',
  defaults: {
    ids: [],
    entities: {},
    selectedBookId: null
  }
})
class BookState {
  @Selector()
  public static entities(state: BookEntitiesModel): BookEntities {
    return state.entities;
  }

  @Action(SearchCompleteAction)
  complete(
    { setState }: StateContext<BookEntitykModel>,
    { payload: books }: SearchCompleteAction
  ) {
    setState(state => {
      const newBooks = books.filter(book => !state.entities[book.id]);
      const newBookIds = newBooks.map(book => book.id);
      const newBookEntities = newBooks.reduce(
        (entities: BookEntities, book: Book) => ({ ...entities, [book.id]: book }),
        {}
      );

      return {
        ids: [...state.ids, ...newBookIds],
        entities: { ...state.entities, ...newBookEntities },
        selectedBookId: state.selectedBookId
      };
    });
  }

  @Action(AddAction)
  add({ setState }: StateContext<BookEntitykModel>, { payload: book }: AddAction) {
    setState(state => {
      if (state.ids.indexOf(book.id) > -1) {
        return state;
      }

      return {
        ids: [...state.ids, book.id],
        entities: { ...state.entities, [book.id]: book },
        selectedBookId: state.selectedBookId
      };
    });
  }

  @Action(SelectAction)
  select(
    { setState }: StateContext<BookEntitykModel>,
    { payload: selectedBookId }: SelectAction
  ) {
    setState(state => ({
      ids: state.ids,
      entities: state.entities,
      selectedBookId
    }));
  }
}
```

As you can see, for each method, we need to write our own actions, which is not very convenient if we have a huge application consisting of a huge number of states with different operations.

```ts
@Component({
  selector: 'book-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <preview-list
      [books]="books$ | async"
      (addBook)="addBook($event)"
      (complete)="completeBooks($event)"
      (selectBook)="selectBookById($event)"
    >
    </preview-list>
  `
})
export class FindBookPageComponent {
  @Select(BookState.entities) books$: Observable<BookEntities>;

  constructor(private store: Store) {}

  selectBookById(id: string) {
    this.store.dispatch(new SelectAction(id));
  }

  addBook(book: Book) {
    this.store.dispatch(new AddAction(book));
  }

  completeBooks(books: Book[]) {
    this.store.dispatch(new SearchCompleteAction(books));
  }
}
```

Therefore, for those who are not comfortable developing using actions, we came up with a new concept - [`@ngxs-labs/data`](https://github.com/ngxs-labs/data).

#### How it addresses this problem:

You no longer need to create the actions for your operations in state.

```ts
import { StateRepository, NgxsDataRepository, query, action } from '@ngxs-labs/data';

@StateRepository()
@State<BookEntitiesModel>({
  name: 'book',
  defaults: {
    ids: [],
    entities: {},
    selectedBookId: null
  }
})
class BookState extends NgxsDataRepository<BookEntitiesModel> {
  @query<BookEntitiesModel, BookEntities>(state => state.entites)
  public books$: Observable<BookEntities>;

  @action() completeBooks(books: Books[]) {
    this.ctx.setState(state => {
      const newBooks = books.filter(book => !state.entities[book.id]);
      const newBookIds = newBooks.map(book => book.id);
      const newBookEntities = newBooks.reduce(
        (entities: BookEntities, book: Book) => ({ ...entities, [book.id]: book }),
        {}
      );

      return {
        ids: [...state.ids, ...newBookIds],
        entities: { ...state.entities, ...newBookEntities },
        selectedBookId: state.selectedBookId
      };
    });
  }

  @action() addBook(book: Book) {
    this.ctx.setState(state => {
      if (state.ids.indexOf(book.id) > -1) {
        return state;
      }

      return {
        ids: [...state.ids, book.id],
        entities: { ...state.entities, [book.id]: book },
        selectedBookId: state.selectedBookId
      };
    });
  }

  @action() selectBookById(selectedBookId: string) {
    this.ctx.setState(state => ({
      ids: state.ids,
      entities: state.entities,
      selectedBookId
    }));
  }
}
```

```ts
@Component({
  selector: 'book-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <preview-list
      [books]="bookState.books$ | async"
      (addBook)="bookState.addBook($event)"
      (complete)="bookState.completeBooks($event)"
      (selectBook)="bookState.selectBookById($event)"
    >
    </preview-list>
  `
})
export class FindBookPageComponent {
  constructor(public bookState: BookState) {}
}
```

Thanks to this, typing improves, you call methods of your state directly.
And you no longer need to worry and come up with actions and types for these actions.

...

### Labs project `@ngxs-labs/actions-executing` created

Announcing [@ngxs-labs/actions-executing](https://github.com/ngxs-labs/actions-executing)

#### Problem Statement:

Sometimes we need to wait for some action completed. But how to do that?

```ts
interface BooksStateModel {
  pending: false;
  books: Book[];
}

@State<BooksStateModel>({
  name: 'books',
  defaults: {
    pending: false,
    books: []
  }
})
export class BooksState {
  constructor(private api: ApiService) {}

  @Action(AddBook)
  add(ctx: StateContext<BooksStateModel>) {
    ctx.patchState({ pending: true });
    return this.api.addBook().pipe(
      tap((book: Book) => {
        ctx.setState((state: BooksStateModel) => ({
          pending: false,
          books: state.books.concat(book)
        }));
      })
    );
  }
}
```

As you can see, this is not very convenient, since we will have to do such things for each state.

```ts
@Component({
  selector: 'app',
  template: `
    <button [disabled]="(books$ | async).pending" (click)="addBook()">
      Add book
    </button>

    <span *ngIf="(books$ | async).pending">
      Loading...
    </span>
  `
})
export class AppComponent {
  @Select(BooksState)
  books$: Observable<BooksStateModel>;

  constructor(private store: Store) {}

  addBook() {
    this.store.dispatch(new AddBook());
  }
}
```

#### How it addresses this problem:

This plugin allows you to easily know if an action is being executed and control UI elements or control flow of your code to execute.

```ts
@State<Book[]>({
  name: 'books',
  defaults: []
})
export class BooksState {
  constructor(private api: ApiService) {}

  @Action(AddBook)
  add(ctx: StateContext<Book[]>) {
    return this.api.addBook().pipe(
      tap((book: Book) => {
        ctx.setState((state: Book[]) => state.concat(book));
      })
    );
  }
}
```

The most common scenarios for using this plugin are to display loading spinner or disable a button while an action is executing.

```ts
import { actionsExecuting, ActionsExecuting } from '@ngxs-labs/actions-executing';

@Component({
  selector: 'app',
  template: `
    <button [disabled]="addBookIsExecuting$ | async" (click)="addBook()">
      Add book
    </button>

    <span *ngIf="addBookIsExecuting$ | async">
      Loading...
    </span>
  `
})
export class AppComponent {
  @Select(actionsExecuting([AddBook]))
  addBookIsExecuting$: Observable<ActionsExecuting>;

  constructor(private store: Store) {}

  addBook() {
    this.store.dispatch(new AddBook());
  }
}
```

---

## Some Useful Links

If you would like any further information on changes in this release please feel free to have a look at our change log. The code for NGXS is all available at https://github.com/ngxs/store and our docs are available at http://ngxs.io/. We have a thriving community on our slack channel so come and join us to keep abreast with the latest developments. Here is the slack invitation link: https://now-examples-slackin-eqzjxuxoem.now.sh/
