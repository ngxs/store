# Announcing NGXS 3.6

(Intro)

## Overview

- 🦄 Ivy Support (TODO decide icon: 🦄 🌼 🍒 🌸 🎄 👀 🍀 🌿 🌈 🚀 ☘️ 🌟 ⭐️ 🎋 🏆)
- 💥 New Lifecycle Hook `ngxsOnChanges`
- 💦 Fixed Actions Stream Subscriptions Leak
- ㊗ ️ State Token
- 🚧 Improved Type Safety

- ...
- 🐛 Bug Fixes
- 🔌 Plugin Improvements and Fixes
- 🔬 NGXS Labs Projects Updates

---

## 🦄 Ivy Support

TODO add content here

Feature: warn about undecorated state class if Ivy is enabled in dev (both JIT/AOT) [#1472](https://github.com/ngxs/store/pull/1472), [#1474](https://github.com/ngxs/store/pull/1474)

Do we even need to make note of this?... Fix: Router Plugin - build compatibility with Angular 9 (Ivy) [#1459](https://github.com/ngxs/store/pull/1459)

Others notable features?

## 💥 New Lifecycle Hook `ngxsOnChanges`

We have added a new lifecycle hook. It was inspired by the `onChanges` hook available in Angular. It was a very simple change that enabled us to add this hook and it opens the opportunity for some great use cases. The new hook looks like this:

```ts
@State({})
class MyState implements NgxsOnChanges {
  ngxsOnChanges(change: NgxsSimpleChange): void {
    // ..
  }
}
```

The method receives the `NgxsSimpleChanges` object that contains the current and previous property values as well as a flag to tell you if this is the first change.

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

#### Lifecycle Sequence

After creating the state by calling its constructor, NGXS calls the lifecycle hook methods in the following sequence at specific moments:

| Hook                 | Purpose and Timing                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| ngxsOnChanges()      | Called _before_ `ngxsOnInit()` and whenever state changes.                                               |
| ngxsOnInit()         | Called _once_, after the _first_ `ngxsOnChanges()` and _before_ the `APP_INITIALIZER` token is resolved. |
| ngxsAfterBootstrap() | Called _once_, after the root view and all its children have been rendered.                              |

Let's have a look at couple of examples:

I. A convenient way to track state changes:

_Before_

```ts
@State({})
class MyState {}

@Component({})
class MyComponent {
  constructor(store: Store) {
    store.select(MyState).subscribe(newState => {
      console.log('MyState has been changed: ', newState);
    });
  }
}
```

One of the problems is that if we are not using the `@ngxs/logger-plugin` or `@ngxs/devtools-plugin`, then we do not know what the previous state was before our state changed. It's great to have such an opportunity out of the box for quick, simple and focused debugging.

_After_

```ts
@State({})
class MyState implements NgxsOnChanges {
  ngxsOnChanges({ previousValue, currentValue }: NgxsSimpleChange): void {
    console.log('MyState has been changed: ', previousValue, currentValue);
  }
}
```

Nice!

II. Convenient to synchronize with the server

Sometimes we need to save state on the server every time the client makes changes to it.

_Before_

```ts
@State({})
class MyState {}

@Component({})
class MyComponent {
  constructor(store: Store, api: ApiService) {
    store.select(MyState).subscribe(async newState => {
      await api.save(newState);
      console.log('The new state has been successfully saved on the server!');
    });
  }
}
```

_After_

```ts
@State({})
class MyState implements NgxsOnChanges {
  constructor(api: ApiService) {}

  async ngxsOnChanges(change: NgxsSimpleChange): void {
    await api.save(change.currentValue).toPromise();
    console.log('The new state has been successfully saved on the server!');
  }
}
```

III. You can write your custom logger without another plugins:

```ts
@State({})
class MyState implements NgxsOnChanges {
  ngxsOnChanges({ previousValue, currentValue }: NgxsSimpleChange): void {
    console.log('prev state', previousValue);
    console.log('next state', currentValue);
  }
}
```

## 💦 Fixed Actions Stream Subscriptions Leak

[#1381](https://github.com/ngxs/store/pull/1381)
(Introduction [with problem statement], details and usage)

## ㊗ ️ State Token

TODO - Add Details

Ref: [#1436](https://github.com/ngxs/store/pull/1436)

## 🚧 Improved Type Safety

### For @Select decorator

TODO - Add Details - Feature: Improved type safety for `@Select` decorator

Ref: [#1453](https://github.com/ngxs/store/pull/1453)

### For Children States

_Before_

```ts
function MyChildState() {}

@State({
  name: 'myState',
  children: [MyChildState, { name: 'myChildOtherState' }, null] // successfully compiled as doesn't infer the correct type
})
class MyState {}
```

_After_

```ts
function MyChildState() {}

@State({
  name: 'myState',
  children: [MyChildState, { name: 'myChildOtherState' }, null] // if you specify the wrong type, there will be a compilation error, as it requires a state class
})
class MyState {}
```

## 🐛 Bug Fixes

For Each: TODO - Add Details
(Introduction, details and usage)

- Fix: Use generic `ModuleWithProviders` type for Ivy compatiblility [#1469](https://github.com/ngxs/store/pull/1469)
- Fix: Explicit typings for state operators [#1395](https://github.com/ngxs/store/pull/1395), [#1405](https://github.com/ngxs/store/pull/1405)
- Fix: Warn if the zone is not actual "NgZone" [#1270](https://github.com/ngxs/store/pull/1270)
- Fix: Do not re-throw error to the global handler if custom is provided [#1379](https://github.com/ngxs/store/pull/1379)
- Fix: Upgrade ng-packagr to fix Ivy issues [#1397](https://github.com/ngxs/store/pull/1397)

## 🔌 Plugin Improvements and Fixes

### Router Plugin

- Fix: Router Plugin - Resolve infinite redirects and browser hanging [#1430](https://github.com/ngxs/store/pull/1430)

In the `3.5.1` release we provided the fix for the [very old issue](https://github.com/ngxs/store/issues/542), where the Router Plugin didn't restore its state after the `RouterCancel` action was emitted. This fix introduced a new bug that was associated with endless redirects and, as a result, browser freeze. The above PR resolves both issues, thereby there will no more browser hanging because of infinite redirects.

TODO - Add Details

### HMR Plugin

- Feature: HMR Plugin - Add hmrIsReloaded utility [#1435](https://github.com/ngxs/store/pull/1435)

If you make any changes in your application during the `ngOnDestroy` Angular lifecycle hook on any of your primary application components then those changes could possibly have side effects for Hot Module Replacement.

```ts
@Component({})
class AppComponent implements OnDestroy {
  ngOnDestroy(): void {
    // my super heavy logic (but not needed for HMR)
  }
}
```

Up until now there hasn't been any way to work around this...
Now you can easily control this situation.

```ts
import { hmrIsReloaded } from '@ngxs/hmr-plugin';

@Component({})
class AppComponent implements OnDestroy {
  ngOnDestroy(): void {
    if (hmrIsReloaded()) {
      return;
    }
    // my super heavy logic (but not needed for HMR)
  }
}
```

- `hmrIsReloaded` - returns `true` if the application was hot module replaced at least once or more.

### Storage Plugin

- Feature: Storage Plugin - Use state classes as keys [#1380](https://github.com/ngxs/store/pull/1380)

Currently, if you want a specific part of the state of the application to be stored then you have to provide the `path` of the state to the storage plugin. Now we have added the ability to provide the state class instead of the path. As an example, given the following state:

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

Now you can use the state class:

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

Today the form plugin exposes the `UpdateFormValue` action that provides the ability to update nested form properties by supplying a `propertyPath` parameter.

_Before_

`UpdateFormValue({ value, path, propertyPath? })`

_After_

`UpdateFormValue({ value, path, propertyPath? })`

```ts
export interface NovelsStateModel {
  newNovelForm: {
    model?: {
      novelName: string;
      authors: {
        name: string;
      }[];
    };
  };
}

@State<NovelsStateModel>({
  name: 'novels',
  defaults: {
    newNovelForm: {
      model: undefined
    }
  }
})
export class NovelsState {}
```

The state contains information about the new novel name and its authors. Let's create a component that will render the reactive form with bounded `ngxsForm` directive:

```ts
@Component({
  selector: 'new-novel-form',
  template: `
    <form [formGroup]="newNovelForm" ngxsForm="novels.newNovelForm" (ngSubmit)="onSubmit()">
      <input type="text" formControlName="novelName" />
      <div
        formArrayName="authors"
        *ngFor="let author of newNovelForm.get('authors').controls; index as index"
      >
        <div [formGroupName]="index">
          <input formControlName="name" />
        </div>
      </div>
      <button type="submit">Create</button>
    </form>
  `
})
export class NewNovelComponent {
  newNovelForm = new FormGroup({
    novelName: new FormControl('Zenith'),
    authors: new FormArray([
      new FormGroup({
        name: new FormControl('Sasha Alsberg')
      })
    ])
  });

  onSubmit() {
    //
  }
}
```

Let's look at the component above again. Assume we want to update the name of the first author in our form, from anywhere in our application. The code would look as follows:

```ts
store.dispatch(
  new UpdateFormValue({
    path: 'novels.newNovelForm',
    value: {
      name: 'Lindsay Cummings'
    },
    propertyPath: 'authors.0'
  })
);
```

Ref: [#1215](https://github.com/ngxs/store/pull/1215)

### WebSocket Plugin

There is a new action for the `@ngxs/websocket-plugin`.

`WebSocketConnected` - Action dispatched when a web socket is connected.

## Ref: [#1371](https://github.com/ngxs/store/pull/1371)

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
