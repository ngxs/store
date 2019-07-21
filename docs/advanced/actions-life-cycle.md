# Actions Life Cycle

This document describes the life cycle of actions, after reading it you will understand how the NGXS handles actions and what stages they may be at.

## Theory

Any action in NGXS can be in one of four states, these states are `DISPATCHED`, `SUCCESSFUL`, `ERRORED`, `CANCELED`.

NGXS has an internal stream of actions. When we dispatch any action using the following code:

```ts
store.dispatch(new GetTickets());
```

The internal actions stream emits an object called `ActionContext`, that has 2 properties:

```ts
{
  action: GetTicketsInstance,
  status: 'DISPATCHED'
}
```

There is an action stream listener that filters actions by `DISPATCHED` status and invokes the appropriate handlers for this action. After all processing for the action has completed it generates a new `ActionContext` with the following `status` value:

```ts
{
  action: GetTicketsInstance,
  status: 'SUCCESSFUL'
}
```

The observable returned by the `dispatch` method is then triggered after the action is handled "successfully" and, in response to this observable, you are able to do the actions you wanted to do on completion of the action.

If the `GetTickets` handler throws an error, for example:

```ts
@Action(GetTickets)
getTickets() {
  throw new Error('This is just a simple error!');
}
```

Then the following `ActionContext` will be created:

```ts
{
  action: GetTicketsInstance,
  status: 'ERRORED'
}
```

Actions can be both synchronous and asynchronous, for example if you send a request to your API and wait for the response. Asynchronous actions are handled in parallel, synchronous actions are handled one after another.

What about the `CANCELED` status? Only asynchronous actions can be canceled, this means that the new action was dispatched before the previous action handler finished doing some asynchronous job. Canceling actions can be achieved by providing options to the `@Action` decorator:

```ts
export class TicketsState {
  constructor(private ticketsService: TicketsService) {}

  @Action(GetTickets, { cancelUncompleted: true })
  getTickets(ctx: StateContext<Ticket[]>) {
    return this.ticketsService.getTickets().pipe(
      tap(tickets => {
        ctx.setState(tickets);
      })
    );
  }
}
```

Imagine a component where you've got a button that dispatches the `GetTickets` action on click:

```ts
@Component({
  selector: 'app-tickets',
  template: `
    <app-ticket *ngFor="let ticket of tickets$ | async"></app-ticket>
    <button (click)="getTickets()">Get tickets</button>
  `
})
export class TicketsComponent {
  @Select(TicketsState) tickets$: Observable<Ticket[]>;

  constructor(private store: Store) {}

  getTickets() {
    this.store.dispatch(new GetTickets());
  }
}
```

If you click the button twice - two actions will be dispatched and the previous action will be canceled because it's asynchronous. This works exactly the same as `switchMap`. If we didn't use NGXS - the code would look as follows:

```ts
@Component({
  selector: 'app-tickets',
  template: `
    <app-ticket *ngFor="let ticket of tickets"></app-ticket>
    <button #button>Get tickets</button>
  `
})
export class TicketsComponent implements OnInit {
  @ViewChild('button', { static: true }) button: ElementRef<HTMLButtonElement>;

  tickets: Ticket[] = [];

  constructor(private ticketsService: TicketsService) {}

  ngOnInit() {
    fromEvent(this.button.nativeElement, 'click')
      .pipe(switchMap(() => this.ticketsService.getTickets()))
      .subscribe(tickets => {
        this.tickets = tickets;
      });
  }
}
```

## Asynchronous actions

Let's talk more about asynchronous actions, imagine a simple state that stores different genres of books and has the following code:

```ts
export interface BooksStateModel {
  novels: Book[];
  detectives: Book[];
}

export class GetNovels {
  static type = '[Books] Get novels';
}

export class GetDetectives {
  static type = '[Books] Get detectives';
}

@State<BooksStateModel>({
  name: 'books',
  defaults: {
    novels: [],
    detectives: []
  }
})
export class BooksState {
  constructor(private booksService: BooksService) {}

  @Action(GetNovels)
  getNovels(ctx: StateContext<BooksStateModel>) {
    return this.booksService.getNovels().pipe(
      tap(novels => {
        ctx.patchState({ novels });
      })
    );
  }

  @Action(GetDetectives)
  getDetectives(ctx: StateContext<BooksStateModel>) {
    return this.booksService.getDetectives().pipe(
      tap(detectives => {
        ctx.patchState({ detectives });
      })
    );
  }
}
```

If you dispatch `GetNovels` and `GetDetectives` actions separately, like:

```ts
store
  .dispatch(new GetNovels())
  .subscribe(() => {
    ...
  });

store
  .dispatch(new GetDetectives())
  .subscribe(() => {
    ...
  });
```

As their action handlers are asynchronous - you can't be sure what HTTP response will come first. In that example we dispatch the `GetNovels` action before `GetDetectives`, but if there were problems on the server side and the server returned a response after 5 seconds, then the `novels` property will be set after `detectives`.

You can dispatch an array of actions:

```ts
store
  .dispatch([
    new GetNovels(),
    new GetDetectives()
  ])
  .subscribe(() => {
    ...
  });
```

We don't care what response will be handled first, but we're sure that we will do an extra work after we receive our `novels` and `detectives`. The below diagram demonstrates how asynchronous actions are handled under the hood:

![Life cycle](../assets/actions-life-cycle.png)

In summary - any dispatched action starts with the status `DISPATCHED`. Next, NGXS looks for handlers that listen to this action, if there are any — NGXS invokes them and processes the return value and errors. If the handler has done some work and has not thrown an error the status of the action changes to `SUCCESSFUL`. If something went wrong while processing the action (for example, if the server returned an error) the status of the action changes to `ERRORED`. If an action handler is marked as `cancelUncompleted` and a new action has arrived before the old one was processed then NGXS interrupts the processing of the first action and changes the action status to `CANCELED`.
