# Actions Stream

Before reading this article, we advise you to become acquainted with the [actions life cycle](./actions-life-cycle.md).

Event sourcing involves modeling the state changes made by applications as an immutable sequence or “log” of events.
Instead of focusing on current state, you focus on the changes that have occurred over time. It is the practice of
modeling your system as a sequence of events. In NGXS, we called this the Actions Stream.

Typically actions directly correspond to state changes but it can be difficult to always make your component react
based on state. As a side effect of this paradigm, we end up creating lots of intermediate state properties
to do things like reset a form/etc. The Actions Stream lets us drive our components based on state along with events
that are emitted.

For example, if we were to have a shopping cart and we were to delete an item out of it you might want to show
a notification that it was successfully removed. In a pure state driven application, you might create some kind
of message array to make the dialog show up. With the Actions Stream, we can respond to the action directly.

The Actions Stream is an Observable that receives all the actions dispatched before the state takes any action on it.

Actions in NGXS also have a lifecycle. Since any potential action can be async we tag actions showing when they are "DISPATCHED", "SUCCESSFUL", "CANCELED" or "ERRORED". This gives you the ability to react to actions at different points in their existence.

Since the actions stream is an Observable, we can use the following operators inside a `pipe(..)`:

- `ofAction`: triggers when any of the below lifecycle events happen
- `ofActionDispatched`: triggers when an action has been dispatched
- `ofActionSuccessful`: triggers when an action has been completed successfully
- `ofActionCanceled`: triggers when an action has been canceled
- `ofActionErrored`: triggers when an action has caused an error to be thrown
- `ofActionCompleted`: triggers when an action has been completed whether it was successful or not (returns completion summary)

All of the above pipes return the original `action` in the observable except for the `ofActionCompleted` pipe which returns some summary information for the completed action. This summary is an object with the following interface:

```ts
interface ActionCompletion<T = any> {
  action: T;
  result: {
    successful: boolean;
    canceled: boolean;
    error?: Error;
  };
}
```

Below is a action handler that filters for `RouteNavigate` actions and then tells the router to navigate to that
route.

```ts
import { Injectable, inject } from '@angular/core';
import { Actions, ofActionDispatched } from '@ngxs/store';

@Injectable({ providedIn: 'root' })
export class RouteHandler implements OnDestroy {
  private destroy$ = new Subject<void>();

  constructor() {
    const actions$ = inject(Actions);
    const router = inject(Router);

    actions$
      .pipe(ofActionDispatched(RouteNavigate), takeUntil(this.destroy$))
      .subscribe(({ payload }) => router.navigate([payload]));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
```

Remember to ensure that you inject the `RouteHandler` somewhere in your application for DI to set things up. If you want this to occur during application startup, this can also be accomplished using the new `ENVIRONMENT_INITIALIZER` token:

```ts
import { ApplicationConfig, ENVIRONMENT_INITIALIZER, inject } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => inject(RouteHandler)
    }
  ]
};
```

The Actions Stream can also be utilized in components. For example, considering the cart deletion scenario, we could use the following code:

```ts
@Component({ ... })
export class CartComponent {
  constructor() {
    const actions$ = inject(Actions);

    actions$.pipe(ofActionSuccessful(CartDelete)).subscribe(() => alert('Item deleted'));
  }
}
```

Also, remember to unsubscribe from the Actions Stream at the end:

```ts
@Component({ ... })
export class CartComponent {
  constructor() {
    const actions$ = inject(Actions);

    actions$
      .pipe(ofActionSuccessful(CartDelete), takeUntilDestroyed())
      .subscribe(() => alert('Item deleted'));
  }
}
```
