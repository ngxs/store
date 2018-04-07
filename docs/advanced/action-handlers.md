# Action Handlers
When dispatching actions and updating state, you typically want to perform some kind
of view operation. Let's say you delete a item and you want to show a notification
afterwards. Typically, we don't want to tie these types of things in our states
to avoid mix of concerns.

A dispatched action handler is when the store received an action to perform a action on. This is triggered BEFORE the state takes any action on it.

NGXS comes packages with a RXJS operator called `ofAction` that lets you filter
the streams easier by passing your action class.

## Action Handler
A good example of a action handler, would be something like triggering a route change.

```TS
import { Actions, ofAction } from '@ngxs/store';

@Injectable()
export class RouteHandler {
  constructor(private router: Router, private actions$: Actions) {
    this.actions$
      .pipe(ofAction(RouteNavigate))
      .subscribe(({ payload }) => this.router.navigate([payload]));
  }
}
```
