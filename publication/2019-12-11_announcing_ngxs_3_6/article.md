# Announcing NGXS 3.6

NGXS v3.6 has been the result of months of hard work by the team, an unwavering commitment to ensuring the stability of the library and a steady focus on what will enhance the core of the library without compromising the simplicity that it offers.

## Overview

- 🌿 Ivy Support
- 💦 Fixed Actions Stream Subscriptions Leak
- 🚧 Improved Type Safety
- ㊗ ️ State Token
- 💥 New Lifecycle Hook: ngxsOnChanges
- 🔧 Other Fixes
- 🔌 Plugin Improvements and Fixes
- 🔬 NGXS Labs Projects Updates

---

## 🌿 Ivy Support

We are actively working on support for Ivy and are 99% there.
The `@ngxs/store` library is fully compatible with Ivy and most of our plugins are compatible.
The only plugin that has an issue is the `@ngxs/router-plugin`. We are working with the Angular team to resolve this issue (see https://github.com/angular/angular/issues/34191).

Due to changes in Angular DI with Ivy, there will be a very small change that you will have to make to your states. This is detailed in the docs here: https://www.ngxs.io/v/master/advanced/ivy-migration-guide
To support our users in making this small change we have added a check (in development mode) to warn of incorrect configuration when using Ivy.

If you pick up any issues in testing this version with Ivy please log an issue and we will look into it immediately.

Related PRs: [#1278](https://github.com/ngxs/store/pull/1278), [#1397](https://github.com/ngxs/store/pull/1397), [#1459](https://github.com/ngxs/store/pull/1459), [#1469](https://github.com/ngxs/store/pull/1469), [#1472](https://github.com/ngxs/store/pull/1472), [#1474](https://github.com/ngxs/store/pull/1474)

## 💦 Fixed Actions Stream Subscriptions Leak

We fixed a subtle memory leak that would occur in applications where the `Actions` stream was used from objects that had a short-lived lifetime (ie. components). This bug would keep these objects in memory through an implicit reference from an undisposed subscription to `this`.

Related PRs: [#1381](https://github.com/ngxs/store/pull/1381)

## 🚧 Improved Type Safety

We have added vastly improved type safety for the `@Select` decorator. If your application fails some type checks after upgrading then we have just saved you some potentially obnoxious runtime bugs 😉.

We have also added some typing sanity checks to what can be passed to the `children` property of a state.

Related PRs: [#1453](https://github.com/ngxs/store/pull/1453), [#1388](https://github.com/ngxs/store/pull/1388)

## ㊗ ️ State Token

We have added a new optional construct called a State Token to NGXS. It is very similar in concept to Injection Tokens in Angular. A State Token can be used as a representation of a state class without referring directly to the state class itself. This allows for a layer of indirection when referring to a state which improves type safety, refactoring and potential for referring to a state before it is lazy loaded.

When creating a StateToken you will provide the location that the state should be stored on your state tree. You can also set a default state model type of the parameterized type T, which can assist with ensuring the type safety of referring to your state in your application. The state token is declared as follows:

```ts
const TODOS_STATE_TOKEN = new StateToken<TodoStateModel[]>('todos');
```

You may choose to not expose the model of your state class to the rest of the application. You can do this by passing a type of `unknown` or `any` to the token. This is useful if you want to keep all knowledge of the structure of your state class model private.

```ts
const TODOS_STATE_TOKEN = new StateToken<unknown>('todos');
```

You can use this token as the name property in your @State declaration. It will be used to provide the path for the state and can also infer the state model type if it has been included in the token. The token can be used in your @State declaration as follows:

```ts
import { Injectable } from '@angular/core';

interface TodoStateModel {
  title: string;
  completed: boolean;
}

// Most likely declared in a different file
const TODOS_STATE_TOKEN = new StateToken<TodoStateModel[]>('todos');

// Note: the @State model type is inferred from in your token.
@State({
  name: TODOS_STATE_TOKEN,
  defaults: []
})
@Injectable()
class TodosState {
  // ...
}
```

A state token with a model type provided can be used in other parts of your application to improve type safety for the `@State`, `@Selector` and `@Select` decorators.

```ts
import { Injectable } from '@angular/core';

interface TodoStateModel {
  title: string;
  completed: boolean;
}

const TODOS_STATE_TOKEN = new StateToken<TodoStateModel[]>('todos');

@State({
  name: TODOS_STATE_TOKEN,
  defaults: [] // if you specify the wrong state type, will be a compilation error
})
@Injectable()
class TodosState {
  @Selector(TODOS_STATE_TOKEN) // if you specify the wrong state type, will be a compilation error
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
@Injectable()
class TodosState {
  @Selector([TODOS_STATE_TOKEN]) // compilation error - TodoStateModel[] does not match string[]
  static completedList(state: string[]): string[] {
    return state;
  }
}
```

The improved type checking for `@Select` will result in the following:

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

We also get improved type inference for `store.select`, `store.selectOnce` and `store.selectSnapshot`:

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

Ref: [Proposal](https://github.com/ngxs/store/issues/1391), [PR #1436](https://github.com/ngxs/store/pull/1436)

## 💥 New Lifecycle Hook: ngxsOnChanges

We have added a new lifecycle hook. It was inspired by the `onChanges` hook available in Angular. It was a very simple change that enabled us to add this hook and it opens the opportunity for some great use cases. The new hook looks like this:

```ts
@State({})
@Injectable()
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

Let's look at a couple of simple examples:

I. A convenient way to track state changes:

_Before_

```ts
@State({})
@Injectable()
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

One of the problems is that if we are not using the `@ngxs/logger-plugin` or `@ngxs/devtools-plugin`, then we do not know what the previous state was before our state changed. With this new lifecycle hook we can get quick, simple and focused debugging.

_After_

```ts
@State({})
@Injectable()
class MyState implements NgxsOnChanges {
  ngxsOnChanges({ previousValue, currentValue }: NgxsSimpleChange): void {
    console.log('MyState has been changed: ', previousValue, currentValue);
  }
}
```

II. Convenient to synchronize with the server

Sometimes we need to save the state to the server whenever it is changed in the client.

_Before_

```ts
@State({})
@Injectable()
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
@Injectable()
class MyState implements NgxsOnChanges {
  constructor(api: ApiService) {}

  async ngxsOnChanges(change: NgxsSimpleChange): void {
    await api.save(change.currentValue).toPromise();
    console.log('The new state has been successfully saved on the server!');
  }
}
```

Ref: [Proposal](https://github.com/ngxs/store/issues/749), [PR #1389](https://github.com/ngxs/store/pull/1389)

## 🔧 Other Fixes

- Add explicit typings for state operators to fix issues with strict mode in typescript
  [Issue](https://github.com/ngxs/store/issues/1375), [PR #1395](https://github.com/ngxs/store/pull/1395), [PR #1405](https://github.com/ngxs/store/pull/1405)
- Warn if the zone is not actual "NgZone" [PR #1270](https://github.com/ngxs/store/pull/1270)
- Do not re-throw error to the global handler if custom handler is provided.
  Issues: [#1145](https://github.com/ngxs/store/issues/1145), [#803](https://github.com/ngxs/store/issues/803), [#463](https://github.com/ngxs/store/issues/463), PR: [#1379](https://github.com/ngxs/store/pull/1379)

## 🔌 Plugin Improvements and Fixes

### Router Plugin

- Fix: Router Plugin - Resolve infinite redirects and browser hanging [#1430](https://github.com/ngxs/store/pull/1430)

In the `3.5.1` release we provided the fix for a [very old issue](https://github.com/ngxs/store/issues/542), where the Router Plugin didn't restore its state after the `RouterCancel` action was emitted. This fix unfortunately introduced a new bug that caused endless redirects and, as a result, crashed the browser! The above PR resolves both issues. 🎉

### HMR Plugin

- Feature: HMR Plugin - Add hmrIsReloaded utility [#1435](https://github.com/ngxs/store/pull/1435)

If you make any changes in your application during the `ngOnDestroy` Angular lifecycle hook on any of your primary application components then those changes could possibly have side effects for Hot Module Replacement.

```ts
@Component({})
class AppComponent implements OnDestroy {
  ngOnDestroy(): void {
    // my very heavy logic (but not needed for HMR)
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

`hmrIsReloaded` - returns `true` if the application was hot module replaced at least once or more.

### Storage Plugin

- Feature: Storage Plugin - Use state classes as keys [#1380](https://github.com/ngxs/store/pull/1380)

Currently, if you want a specific part of the state of the application to be stored then you have to provide the `path` of the state to the storage plugin. Now we have added the ability to provide the state class or a state token instead of the path. As an example, given the following state:

```ts
@State<Novel[]>({
  name: 'novels',
  defaults: []
})
@Injectable()
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

This is a great improvement because it removes the requirement for you to provide the `path` of a state in multiple places in your application (with the risk of getting out of sync if there are any changes to the `path`). Now you can just pass the reference to the state class (or the state token) and the plugin will automatically translate it to the `path`.

### Form Plugin

The form plugin `UpdateFormValue` action has been enhanced with the ability to specify a `propertyPath` parameter in order to update nested form properties directly.

_Before_

`UpdateFormValue({ value, path })`

_After_

`UpdateFormValue({ value, path, propertyPath? })`

Given the following state:

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
@Injectable()
export class NovelsState {}
```

The state contains information about the new novel name and its authors. Let's create a component that will render the reactive form with the `ngxsForm` directive to connect the form to the store:

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

Now, if we want to update the name of the first author in our form from anywhere in our application we can leverage the new property. The code will look as follows:

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

Ref: [Issue #910](https://github.com/ngxs/store/issues/910), [Issue #260](https://github.com/ngxs/store/issues/260), [PR #1215](https://github.com/ngxs/store/pull/1215)

### WebSocket Plugin

There is a new action for the `@ngxs/websocket-plugin`.

`WebSocketConnected` - This action is dispatched when a web socket is connected. Previously we only had actions for `WebSocketDisconnected` and `WebSocketConnectionUpdated`. This new action completes the picture to allow for observing the web socket connection lifecycle.

Ref: [PR #1371](https://github.com/ngxs/store/pull/1371)

## 🔬 NGXS Labs Projects Updates

### New Labs Project: @ngxs-labs/data

Announcing [@ngxs-labs/data](https://github.com/ngxs-labs/data)

#### The Problem:

As an application grows larger the number Action classes increases. Often these actions are merely a call through to the state. In this case the abstraction that actions provide may be of less value than the extra effort required to maintain them. Let's look at the following state:

```ts
export interface Book {
  id: string;
  volumeInfo: any;
}

export class SearchBooksComplete {
  static readonly type = '[Book] Search Complete';

  constructor(public payload: Book[]) {}
}

export class AddBook {
  static readonly type = '[Book] add';

  constructor(public payload: Book) {}
}

export class SelectBook {
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
@Injectable()
class BookState {
  @Selector()
  public static entities(state: BookEntitiesModel): BookEntities {
    return state.entities;
  }

  @Action(SearchBooksComplete)
  complete(
    { setState }: StateContext<BookEntitykModel>,
    { payload: books }: SearchBooksComplete
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

  @Action(AddBook)
  add({ setState }: StateContext<BookEntitykModel>, { payload: book }: AddBook) {
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

  @Action(SelectBook)
  select(
    { setState }: StateContext<BookEntitykModel>,
    { payload: selectedBookId }: SelectBook
  ) {
    setState(state => ({
      ids: state.ids,
      entities: state.entities,
      selectedBookId
    }));
  }
}
```

As you can see, for each method we need to write an action and our component would look like this:

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
    this.store.dispatch(new SelectBook(id));
  }

  addBook(book: Book) {
    this.store.dispatch(new AddBook(book));
  }

  completeBooks(books: Book[]) {
    this.store.dispatch(new SearchBooksComplete(books));
  }
}
```

If you would rather not write actions in your application then the [`@ngxs-labs/data`](https://github.com/ngxs-labs/data) plugin is for you!

#### How This Plugin Helps:

By leveraging this plugin you can remove the need to create actions for the operations in your state. Your state now acts as a facade where its public methods can be invoked directly and the state operation will be invoked accordingly (behind the scenes a runtime action is created and dispatched, and the declared function handles the action).

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
@Injectable()
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

And the component now looks like this:

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

As you can see you can now call methods of your state directly and you no longer need to worry and come up with actions to communicate with your state.

As with anything, there are trade-offs to this approach, so please ensure that you have read about the benefits to CQRS before abandoning the idea of Actions. On the other hand, this is a much simpler approach to state management that may be a better fit for your team and your product.

---

### New Labs Project: @ngxs-labs/actions-executing

Announcing [@ngxs-labs/actions-executing](https://github.com/ngxs-labs/actions-executing)

#### The Problem:

Sometimes we want to wait for some action to complete and we want to update our UI accordingly to represent this pending state. The most common pattern for doing this is as follows:

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
@Injectable()
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

What started as a UI concern has now littered our state with extra code. We will also end up having selectors to expose this property.

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

Is there another approach we can take to address this need more cleanly?

#### How This Plugin Helps:

We can now use the `@ngxs-labs/actions-executing` plugin to easily determine if an action is being executed and control UI elements or application flow in response. In order to use this plugin we need to load the plugin in our `AppModule` as follows:

```ts
//...
import { NgxsModule } from '@ngxs/store';
import { NgxsActionsExecutingModule } from '@ngxs-labs/actions-executing';

@NgModule({
  //...
  imports: [
    //...
    NgxsModule.forRoot([
      //... your states
    ]),
    NgxsActionsExecutingModule.forRoot()
  ]
  //...
})
export class AppModule {}
```

The state becomes much simpler with the `pending` property removed:

```ts
@State<Book[]>({
  name: 'books',
  defaults: []
})
@Injectable()
export class BooksState {
  constructor(private api: ApiService) {}

  @Action(AddBook)
  add(ctx: StateContext<Book[]>) {
    return this.api.addBook().pipe(
      tap((book: Book) => {
        ctx.setState(state => state.concat(book));
      })
    );
  }
}
```

By leveraging the plugin our component can display a loading spinner or disable a button while an action is executing. The component code will now become:

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

The `actionsExecuting` selector can be used to track one, many or even all actions (by leaving out the parameter). Included in the data it returns is the count of the executing actions by action type.

---

## Some Useful Links

If you would like any further information on changes in this release please feel free to have a look at our changelog. The code for NGXS is all available at https://github.com/ngxs/store and our docs are available at http://ngxs.io/. We have a thriving community on our slack channel so come and join us to keep abreast of the latest developments. Here is the slack invitation link: https://now-examples-slackin-eqzjxuxoem.now.sh/
