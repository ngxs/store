# Selects
Selects are functions that slice a specific portion of state from the global state container.

In CQRS and Redux patterns, we keep READ and WRITE separated, we follow this pattern in NGXS.
When we want to read data out of our store, we use a select operator to retrieve this data.

In NGXS, there are 2 methods to select state, we can either call the `select` method on the
`Store` service or use the `@Select` decorator. First let's look at the `select` decorator.

### Select Decorators
You can select slices of data from the store using the `@Select` decorator. It has a few
different ways to get your data out, whether passing the state class, a function or dot notation
of the object graph.

```TS
import { Select } from '@ngxs/store';

import { ZooState } from './zoo.state';

@Component({ ... })
export class ZooComponent {
 // Reads the name of the store from the store class
  @Select(ZooState) animals$: Observable<string[]>;

  // Reads the name of the property minus the $
  @Select() animals$: Observable<string[]>;

  // Also accepts a function like our select method
  @Select(state => state.animals) animals$: Observable<string[]>;
}
```

### Store Select Function
The `Store` class also has a `select` function:

```TS
import { Store } from '@ngxs/store';

@Component({ ... })
export class ZooComponent {
  animals$: Observable<string[]>;
  
  constructor(private store: Store) {
    this.animals$ = this.store.select(state => state.zoo.animals);
  }
}
```

This is most helpful to programmatic selects where we can't statically
declare them with the select decorator.

There is also a `selectOnce` that will basically do `select().pipe(take(1))` for
you automatically as a shortcut method. This is very useful for unit testing.

### Snapshot Selects
On the store, there is a `selectSnapshot` function that allows you to pull out the
raw value. This is helpful for cases where you need to get a static value but can't
use observables. A good use case for this would be a interceptor that needs to get
the token from the auth state.

```TS
@Injectable()
export class JWTInterceptor implements HttpInterceptor {

  constructor(private _store: Store) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this._store.selectSnapshot<string>((state: AppState) => state.auth.token);
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next.handle(req);
  }

}
```

### Memoized Selectors
Oftentimes you will use the same selectors in several different places
or have complex selectors you want to keep separate from your component.
NGXS has a `Selector` decorator that will help us with that. This decorator
will memoize the function for performance as well as automatically slice
the state portion you are dealing with.

Let's create a selector that will return a list of pandas from the animals.

```TS
@State<string[]>({
  name: 'animals',
  defaults: []
})
export class ZooState {
  @Selector()
  static pandas(state: string[]) {
    return state.filter(s => s.indexOf('panda') > -1);
  }
}
```

Notice, my `state` is just the local state for this `ZooState` class. Now in our component,
we simply do:

```TS
@Component({...})
export class AppComponent {
  @Select(ZooState.pandas) pandas$: Observable<string[]>;
}
```

and our `pandas$` will only return animals with the name panda in them.
