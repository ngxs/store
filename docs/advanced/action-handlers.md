# Action Handlers
When dispatching actions and updating state, you typically want to perform some kind
of view operation. Let's say you delete a item and you want to show a notification
afterwards. Typically, we don't want to tie these types of things in our states
to avoid mix of concerns.

NGXS has two types of action handlers; dispatched and completed. A dispatched action
handler is when the store recieved an action to perform a action on. This is triggered
BEFORE the state takes any action on it. The completed stream is when all the actions
tied to that action have executed (whether sync or async). The completion stream is
very useful for the type of operation I described above. The completion stream can help
you avoid boilerplate like having more actions for completions.

NGXS comes packages with a RXJS operator called `ofAction` that lets you filter
the streams easier by passing your action class.

## Action Handler
A good example of a action handler, would be something like triggering a route change.

```TS
import { Actions, ofAction } from '@ngxs/store';

@Injectable()
export class RouteHander {
  constructor(private router: Router, private actions$: Actions) {
    this.actions$
      .pipe(ofAction(RouteNavigate))
      .subscribe(({ payload }) => this.router.navigate([payload]));
  }
}
```

## Action Completion Handler
A good example of a action completion handler, would be something like showing a notiication
on delete.

```TS
import { Actions, ofAction } from '@ngxs/store';

@Component({ ... })
export class AnimalComponent {
  constructor(private actionCompletions$: ActionCompletions, private router: Router) {}

  ngOnInit() {
    this.actionCompletions$
      .pipe(ofAction(DeleteAnimal))
      .subscribe(({ payload }) => alert(`Deleted ${payload}`));
  }
}
```
