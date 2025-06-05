# Action Handlers

Before reading this article, we advise you to become acquainted with the [actions life cycle](./actions-life-cycle.md).

Event sourcing involves modeling the state changes made by applications as an immutable sequence or “log” of events.
Instead of focusing on current state, you focus on the changes that have occurred over time. It is the practice of
modeling your system as a sequence of events. In NGXS, we called this Action Handlers.

Typically actions directly correspond to state changes but it can be difficult to always make your component react
based on state. As a side effect of this paradigm, we end up creating lots of intermediate state properties
to do things like reset a form/etc. Action handlers let us drive our components based on state along with events
that are emitted.

For example, if we were to have a shopping cart and we were to delete an item out of it you might want to show
a notification that it was successfully removed. In a pure state driven application, you might create some kind
of message array to make the dialog show up. With Action Handlers, we can respond to the action directly.

The action handler is an Observable that receives all the actions dispatched before the state takes any action on it.

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

Action handlers can also be utilized in components. For example, considering the cart deletion scenario, we could use the following code:

```ts
@Component({ ... })
export class CartComponent {
  constructor() {
    const actions$ = inject(Actions);

    actions$.pipe(ofActionSuccessful(CartDelete)).subscribe(() => alert('Item deleted'));
  }
}
```

Also, remember to unsubscribe from the actions stream at the end:

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

## Dynamic Action Handlers with ActionDirector

Sometimes you need to attach action handlers dynamically after state initialization. For example, you might want to:

- Add action handlers conditionally based on runtime conditions
- Add action handlers for lazy-loaded modules
- Add temporary action handlers that can be removed later

NGXS provides the `ActionDirector` service for this purpose. The `ActionDirector` allows you to attach action handlers to a state at any point after initialization and gives you the ability to detach them when no longer needed.

### Attaching an Action Handler

```ts
import { ActionDirector, createSelector } from '@ngxs/store';
import { inject, Injectable } from '@angular/core';

// State token
const COUNTRIES_STATE_TOKEN = new StateToken<string[]>('countries');

// Action
export class AddCountry {
  static readonly type = '[Countries] Add Country';
  constructor(public country: string) {}
}

@Injectable({ providedIn: 'root' })
export class CountryService {
  private actionDirector = inject(ActionDirector);
  private handle: { detach: () => void } | null = null;

  // Attach the action handler
  attachCountryHandler() {
    if (this.handle) return; // Already attached

    this.handle = this.actionDirector.attachAction(
      COUNTRIES_STATE_TOKEN,
      AddCountry,
      (ctx, action) => {
        // Update state
        ctx.setState(countries => [...countries, action.country]);
      }
    );
  }

  // Detach the action handler when no longer needed
  detachCountryHandler() {
    if (this.handle) {
      this.handle.detach();
      this.handle = null;
    }
  }
}
```

### When to Use Dynamic Action Handlers

Dynamic action handlers are useful in several scenarios:

1. **Lazy-loaded features**: Attach action handlers when a feature module is loaded
2. **Temporary behaviors**: Create handlers that only exist for a specific duration
3. **Conditional action handling**: Enable action handlers based on runtime conditions
4. **Plugin systems**: Allow plugins to register their own action handlers
5. **Testing**: Simplifies testing by allowing you to inject different handlers

### The detach Function

The `attachAction` method returns an object with a `detach` function that can be called to remove the action handler. This enables proper cleanup and prevents memory leaks.

```ts
// Example of attaching and later detaching a handler
const handle = actionDirector.attachAction(STATE_TOKEN, SomeAction, (ctx, action) => {
  // Handler logic
});

// Later, when the handler is no longer needed:
handle.detach();
```
