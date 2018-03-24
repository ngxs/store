# Pubsub
Let's say you want to listen to events outside of your store or perhaps you want to
create a pub sub scenario where an event might not be tied to a store at all.
To do this, we can inject the `Actions` observable and just listen in.

To make determining if the event is what we actually want to listen to, we have an 
RxJS pipeable operator called `ofAction(NewAnimal)` we can use too!

```TS
import { Actions, ofAction } from '@ngxs/store';

@Injectable()
export class RouteHandler {
  constructor(private actions$: Actions, private router: Router) {
    this.actions$
      .pipe(ofAction(NewAnimal))
      .subscribe((action) => alert('New Animal!'));
  }
}
```
