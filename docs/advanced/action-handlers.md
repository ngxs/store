# Action Handlers

Event sourcing involves modeling the state changes made by applications as an immutable sequence or “log” of events.
Instead of focussing on current state, you focus on the changes that have occurred over time. It is the practice of
modelling your system as a sequence of events. In NGXS, we called this Action Handlers.

Typically actions directly correspond to state changes but it can be difficult to always make your component react
based on state. As a side effect of this paradigm, we end up creating lots of intermediate state properties
to do things like reset a form/etc. Action handlers let us drive our components based on state along with events
that emit.

For example, if we were to have a shopping cart and we were to delete an item out of it you might want to show
a notification that it was successfully removed. In a pure state driven application, you might create some kind
of message array to make the dialog show up. With Action Handlers, we can respond to the action directly.

The action handler is a observable that recieves all the actions dispatched before the state takes any action on it.

Actions in NGXS also have a lifecycle. Since any potential action can be async we tag actions showing whether they are "DISPATCHED" or "COMPLETED". This gives you the ability to react to actions at different points in their existence.

Since its an observable, we can use pipes and created 4 of them.

* `ofAction`: triggers when any of the below lifecycle events happen
* `ofActionDispatched`: triggers when an action has been dispatched but NOT when it completes
* `ofActionCompleted`: triggers when an action has been completed but NOT when it is dispatched
* `ofActionErrored`: triggers when an action has caused an error to be thrown

Below is a action handler that filters for `RouteNavigate` actions and then tells the router to navigate to that
route.

```TS
import { Actions, ofActionDispatched } from '@ngxs/store';

@Injectable()
export class RouteHandler {
  constructor(private router: Router, private actions$: Actions) {
    this.actions$
      .pipe(ofActionDispatched(RouteNavigate))
      .subscribe(({ payload }) => this.router.navigate([payload]));
  }
}
```

Remember you need to make sure and inject the `RouteHandler` somewhere in your application for DI to hook things up. If
you want it to happen on application startup, Angular provides a method for doing this:

```TS
import { NgModule, APP_INITIALIZER } from '@angular/core';

// Noop handler for factory function
function noop() { return function() {}; };

@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: noop,
      deps: [RouteHandler],
      multi: true
    }
  ]
})
export class AppModule {}
```

Action handlers can be used in components too. Given the cart deletion example, we might construct something like:

```TS
@Component({ ... })
export class CartComponent {
  constructor(private actions$: Actions) {}

  ngOnInit() {
    this.actions$.pipe(ofActionCompleted(CartDelete)).subscribe(() => alert('Item deleted'));
  }
}
```
