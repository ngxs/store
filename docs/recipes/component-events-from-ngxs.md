# Component Events from NGXS

Developers always use the `@Output` decorator in conjunction with the `EventEmitter`. The below code has been seen by any Angular developer:

```ts
@Output() search = new EventEmitter<string>();
```

The secret is that the `@Output` can decorate any "observable" property. The Angular compiler emits needful information for the Angular itself that says "hey, please subscribe to the `search` class property and dispatch `CustomEvent` any time the observable emits".

Let's imagine that we're a part of the A team. We develop custom element that uses NGXS and we want to provide this component to the team B. The team B doesn't know anything about NGXS, they cannot use our API. Our element is just a black box that exposes data via `@Output`.

We develop the `app-email-list` custom element that emits `messagesLoaded` DOM event and gives the data to the team B for analytics. Given the following code:

```ts
@Component({
  selector: 'app-email-list',
  template: `
    @for (message of messages(); track message) {
      <app-message [message]="message" />
    }

    <app-button (click)="refresh()">Refresh messages</app-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MessageComponent, ButtonComponent]
})
export class EmailListComponent {
  messages: Signal<Message[]> = this.store.selectSignal(MessagesState.getMessages);

  @Output() messagesLoaded = new EventEmitter<Message[]>();

  constructor(private store: Store) {}

  refresh(): void {
    this.store.dispatch(new LoadMessages()).subscribe(() => {
      const messages = this.store.selectSnapshot(MessagesState.getMessages);
      this.messagesLoaded.emit(messages);
    });
  }
}
```

The above code is very simple and is used for demonstrating purposes only! As you can see we dispatch the `LoadMessages` action every time the user clicks "Refresh messages" button. After the `LoadMessages` action handler has completed his asynchronous job we emit the `messagesLoaded` event. Let's be more declarative:

```ts
@Component({
  selector: 'app-email-list',
  template: `
    @for (message of messages(); track message) {
      <app-message [message]="message" />
    }

    <app-button (click)="refresh()">Refresh messages</app-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MessageComponent, ButtonComponent]
})
export class EmailListComponent {
  messages: Signal<Message[]> = this.store.selectSignal(MessagesState.getMessages);

  button = viewChild.required(ButtonComponent);

  @Output() messagesLoaded = toObservable(this.button).pipe(
    first(Boolean),
    mergeMap(() => this.button().click),
    switchMap(() => this.store.dispatch(new LoadMessages())),
    map(() => this.store.selectSnapshot(MessagesState.getMessages))
  );

  constructor(private store: Store) {}
}
```

Assume that `ButtonComponent.click` is an `EventEmitter`. Wow, we've done it in a more declarative and reactive way. So every time the user clicks the `app-button` our `switchMap` will produce the next `store.dispatch` subscribe and unsubscribe from the previous one. Next we use the `map` operator that will map our stream value to the `Message[]` array from our state.

Now let's take away that idea with A and B teams. As our store is a single source of truth thus we can listen to any action from any part of our application. DOM events can be handy to use with the `Actions` stream. Assume we've got a component that emits `booksLoaded` event every time when different genre of books are loaded:

```ts
// books.state.ts
const enum Genre {
  Novel,
  Detective,
  Horror
}

export class LoadBooks {
  static readonly type = '[Books] Load books';
  constructor(public genre: Genre) {}
}

export class BooksState {
  static getBooks(genre: Genre) {
    return createSelector([BooksState], (books: Book[]) =>
      books.filter(book => book.genre === genre)
    );
  }
}

// books.component.ts
export class BooksComponent {
  @Output() booksLoaded = this.actions$.pipe(
    ofActionSuccessful(LoadBooks),
    map((action: LoadBooks) => this.store.selectSnapshot(BooksState.getBooks(action.genre)))
  );

  constructor(
    private store: Store,
    private actions$: Actions
  ) {}
}
```

This might significantly reduce your code business logic and do it in a more declarative and reactive way.
