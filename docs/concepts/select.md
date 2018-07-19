# Selects
Selects are functions that slice a specific portion of state from the global state container.

In CQRS and Redux patterns, we keep READ and WRITE separated. This pattern also exists in NGXS.
When we want to read data out of our store, we use a select operator to retrieve this data.

In NGXS, there are two methods to select state, we can either call the `select` method on the
`Store` service or use the `@Select` decorator. First let's look at the `@Select` decorator.

### Select Decorators
You can select slices of data from the store using the `@Select` decorator. It has a few
different ways to get your data out, whether passing the state class, a function, a different state class
or a memoized selector.

```TS
import { Select } from '@ngxs/store';
import { ZooState } from './zoo.state';

@Component({ ... })
export class ZooComponent {
 // Reads the name of the state from the state class
  @Select(ZooState) animals$: Observable<string[]>;

  // Uses the pandas memoized selector to only return pandas
  @Select(ZooState.pandas) pandas$: Observable<string[]>;

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
you automatically as a shortcut method.

This can be useful in route guards where you only want to check the current state and not continue
watching the stream. It can also be useful for unit testing.

### Snapshot Selects
On the store, there is a `selectSnapshot` function that allows you to pull out the
raw value. This is helpful for cases where you need to get a static value but can't
use Observables. A good use case for this would be an interceptor that needs to get
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
NGXS has a `@Selector` decorator that will help us with that. This decorator
will memoize the function for performance as well as automatically slice
the state portion you are dealing with.

Let's create a selector that will return a list of pandas from the animals.

```TS
@State<string[]>({
  name: 'animals',
  defaults: []
})
export class ZooState {
  @Selector() static pandas(state: string[]) {
    return state.filter(s => s.indexOf('panda') > -1);
  }
}
```

Notice, the `state` is just the local state for this `ZooState` class. Now in our component,
we simply do:

```TS
@Component({...})
export class AppComponent {
  @Select(ZooState.pandas) pandas$: Observable<string[]>;
}
```

and our `pandas$` will only return animals with the name panda in them.

These selectors can also accept arguments. For instance, I can have a selector
that will only filter my animals to the passed type.

```TS
@State<string[]>({
  name: 'animals',
  defaults: []
})
export class ZooState {
  @Selector() static pandas(state) {
    return (type) => {
      return state.filter(s => s.indexOf(type) > -1);
    };
  }
}
```

then you can use `store.select` and pass filter to `rxjs` `map` pipeline function.

```TS
import { Store } from '@ngxs/store';
import { map } from 'rxjs/operators';

@Component({ ... })
export class ZooComponent {
  babyPandas$: Observable<string[]>;
  
    constructor(private store: Store) {
      this.babyPandas$ = this.store.select(ZooState.pandas).pipe(map(filterFn => filterFn('baby')));
    }
}
```

or you can import and use `MemoizedSelect` decorator.

```TS
import { MemoizedSelect } from '@ngxs/store';

@Component({ ... })
export class ZooComponent {
  @MemoizedSelect(ZooState.pandas, 'panda') babyPandas$: Observable<string[]>;
}
```

#### Joining Selectors
When defining a selector, you can also pass other selectors into the signature
of the `Selector` decorator to join other selectors with this state selector.

```TS
@State({ ... })
export class PreferencesState { ... }

@State({ ... })
export class ZooState {
  @Selector([PreferencesState])
  static pandas(state: string[], preferencesState) {
    return state.filter(s =>
      (s.indexOf('panda') > -1 && s.location === preferencesState.location));
  }
}
```

When using the `Selector` decorator along with a state class, it will still
inject the state class's state first followed by the other selectors in the order
they were passed in the signature.


#### Meta Selectors
By default selectors in NGXS are bound to a state. Sometimes you need the ability
to join to un-related states in a high-performance re-usable fashion. A meta selector
is a selector allows you to bind N number of selectors together to return a state
stream.

Let's say we have 2 states; 'zoos' and 'theme parks'. We have a component that needs
to show all the zoos and theme parks for a given city. These are two very distinct
state classes that are likely not related in any manner. We can use a meta selector
to join these two states together like:

```TS
@Injectable()
export class CityService {
  @Selector([Zoo, ThemePark]) static zooThemeParks(zoos, themeParks) {
    return [
      ...zoos,
      ...themeParks
    ];
  }
}
```

now we can use this `zooThemeParks` selector anywhere in our application.
