# Selects

Selects are functions that slice a specific portion of state from the global state container.

In CQRS and Redux patterns, we maintain a separation between READ and WRITE operations. This pattern is also present in NGXS. When we need to retrieve data from our store, we utilize a select operator to access this data.

In NGXS, the `Store` service provides multiple methods for selecting state.

## Store Select Function

The `Store` class also has a `select` function:

```ts
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

@Component({ ... })
export class ZooComponent {
  animals$: Observable<string[]> = this.store.select(ZooState.getAnimals);

  constructor(private store: Store) {}
}
```

There is also a `selectOnce` that will basically do `select().pipe(take(1))` for
you automatically as a shortcut method.

This can be useful in route guards where you only want to check the current state and not continue watching the stream. It can also be useful for unit testing.

## Store Select Signal Function

The `Store` can return a signal instead of an observable:

```ts
import { Signal } from '@angular/core';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-zoo',
  template: `
    @for (panda of pandas(); track $index) {
      <p>{{ panda }}</p>
    }
  `
})
export class ZooComponent {
  pandas: Signal<string[]> = this.store.selectSignal(ZooState.getPandas);

  constructor(private store: Store) {}
}
```

The `selectSignal` function only accepts a 'typed' selector function (a function that carries type information) and a state token. There is no option to provide an anonymous function as demonstrated in the previous example with `this.store.select(state => state.zoo.animals)`.

We don't allow any options to be provided to the internal `computed` function, such as an equality function, because immutability is a fundamental premise for the existence of data in our state. Users should never have a reason to specify the equality comparison function.

## Snapshot Selects

On the store, there is a `selectSnapshot` function that allows you to pull out the
raw value. This is helpful for cases where you need to get a static value but can't
use Observables. A good use case for this would be an interceptor that needs to get
the token from the auth state.

```ts
@Injectable()
export class JWTInterceptor implements HttpInterceptor {
  constructor(private store: Store) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.store.selectSnapshot<string>(AuthState.getToken);

    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next.handle(req);
  }
}
```

## Memoized Selectors

Oftentimes you will use the same selectors in several different places
or have complex selectors you want to keep separate from your component.
NGXS has a `@Selector` decorator that will help us with that. This decorator
will memoize the function for performance as well as automatically slice
the state portion you are dealing with.

Let's create a selector that will return a list of pandas from the animals.

```ts
import { Injectable } from '@angular/core';
import { State, Selector } from '@ngxs/store';

@State<string[]>({
  name: 'animals',
  defaults: []
})
@Injectable()
export class ZooState {
  @Selector()
  static getPandas(state: string[]) {
    return state.filter(s => s.indexOf('panda') > -1);
  }
}
```

Notice, the `state` is just the local state for this `ZooState` class. Now in our component,
we simply do:

```ts
@Component({ ... })
export class AppComponent {
  pandas = this.store.selectSignal(ZooState.getPandas);

  constructor(private store: Store) {}
}
```

And our `pandas` will only return animals with the name panda in them.

### Selector Options

The behavior of the memoized selectors can be configured at a global level using the `selectorOptions` property in the options passed to the `provideStore` or `NgxsModule.forRoot` call (see [Options](../advanced/options.md)).  
These options can also be provided through the `@SelectorOptions` decorator at a Class or Method level in order to configure the behavior of selectors within that scope. The following options are available:

#### `suppressErrors`

- `true` will cause any error within a selector to result in the selector returning `undefined`.
- `false` results in these errors propagating through the stack that triggered the evaluation of the selector that caused the error.

#### `injectContainerState`

- `true` will cause all selectors defined within a state class to receive the container class' state model as their first parameter. As a result every selector would be re-evaluated after any change to that state.
- `false` will prevent the injection of the container state model as the first parameter of a selector method (defined within a state class) that joins to other selectors for its parameters.

### Memoized Selectors with Arguments

Selectors can be configured to accept arguments.  
There are two patterns that allow for this: [Lazy Selectors](#lazy-selectors) or [Dynamic Selectors](#dynamic-selectors)

#### Lazy Selectors

To create a lazy selector all that you need to do is return a function from the selector.
The function returned by the selector will be memoized automatically and the logic inside this function will be evaluated at a later stage when the consumer of the selector executes the function. Note that this function can take any number of arguments (or zero arguments) as it is the consumer's responsibility to supply them.

For instance, I can have a Lazy Selector that will filter my pandas to the provided type of panda.

```ts
@State<string[]>({
  name: 'animals',
  defaults: []
})
@Injectable()
export class ZooState {
  @Selector()
  static getPandas(state: string[]) {
    return (type: string) => {
      return state.filter(s => s.indexOf('panda') > -1).filter(s => s.indexOf(type) > -1);
    };
  }
}
```

Then you can use `store.selectSignal` and evaluate the lazy function using the `computed`:

```ts
import { computed } from '@angular/core';
import { Store } from '@ngxs/store';
import { map } from 'rxjs';

@Component({ ... })
export class ZooComponent {
  pandas = this.store.selectSignal(ZooState.getPandas);

  babyPandas = computed(() => {
    const filterFn = this.pandas();
    return filterFn('baby');
  });

  constructor(private store: Store) {}
}
```

#### Dynamic Selectors

A dynamic selector is created by using the `createSelector` function as opposed to the `@Selector` decorator. It does not need to be created in any special area at any specific time. The typical use case though would be to create a selector that looks like a normal selector but takes an argument to provide to the dynamic selector.

For instance, I can have a Dynamic Selector that will filter my pandas to the provided type of panda:

```ts
@State<string[]>({
  name: 'animals',
  defaults: []
})
@Injectable()
export class ZooState {
  static getPandas(type: string) {
    return createSelector([ZooState], (state: string[]) => {
      return state.filter(s => s.indexOf('panda') > -1).filter(s => s.indexOf(type) > -1);
    });
  }
}
```

Then you can use `selectSignal` to call this function with the parameter provided:

```ts
import { Store } from '@ngxs/store';
import { map } from 'rxjs';

@Component({ ... })
export class ZooComponent {
  babyPandas = this.store.selectSignal(ZooState.getPandas('baby'));

  adultPandas = this.store.selectSignal(ZooState.getPandas('adult'));

  constructor(private store: Store) {}
}
```

Note that each of these selectors have their own separate memoization. Even if two dynamic selectors created in this way are provided the same argument, they will have separate memoization.

These selectors are extremely powerful and are what is used under the hood to create all other selectors.

_Dynamic Selectors (dynamic state slice)_

An interesting use case would be to allow for a selector to be reused to select from States that have the same structure. For example:

```ts
export class SharedSelectors {
  static getEntities(stateClass) {
    return createSelector([stateClass], (state: { entities: any[] }) => {
      return state.entities;
    });
  }
}
```

Then this could be used as follows:

```ts
@Component({ ... })
export class ZooComponent {
  zoos = this.store.selectSignal(SharedSelectors.getEntities(ZooState));

  parks = this.store.selectSignal(SharedSelectors.getEntities(ParkState));

  constructor(private store: Store) {}
}
```

### Joining Selectors

When defining a selector, you can also pass other selectors into the signature
of the `Selector` decorator to join other selectors with this state selector:

```ts
@State<PreferencesStateModel>({ ... })
@Injectable()
export class PreferencesState { ... }

@State<string[]>({ ... })
@Injectable()
export class ZooState {
  @Selector([ZooState, PreferencesState])
  static firstLocalPanda(state: string[], preferencesState: PreferencesStateModel) {
    return state.find(
      s => s.indexOf('panda') > -1 && s.indexOf(preferencesState.location)
    );
  }

  @Selector([ZooState.firstLocalPanda])
  static happyLocalPanda(panda: string) {
    return 'happy ' + panda;
  }

}
```

Please note that we have to explicitly pass the `ZooState` into the first selector since container states are not injected by default (unless you set `injectContainerState` to `true`).

The memoized selectors will recalculate when any of their input parameter values change (whether they use them or not). In the case of the behavior above where the state class's state model is injected as the first input parameter, the selectors will recalculate on any change to this model.

### Meta Selectors

By default selectors in NGXS are bound to a state. Sometimes you need the ability
to join to un-related states in a high-performance re-usable fashion. A meta selector
is a selector allows you to bind N number of selectors together to return a state
stream.

Let's say we have 2 states; 'zoos' and 'theme parks'. We have a component that needs
to show all the zoos and theme parks for a given city. These are two very distinct
state classes that are likely not related in any manner. We can use a meta selector
to join these two states together like:

```ts
export class CityService {
  @Selector([Zoo, ThemePark])
  static getZooThemeParks(zoos, themeParks) {
    return [...zoos, ...themeParks];
  }
}
```

Now we can use this `getZooThemeParks` selector anywhere in our application.

### The Order of Interacting Selectors

In versions of NGXS prior to 3.6.1 there was an issue where the order which the selectors were declared would matter. This was fixed in PR [#1514](https://github.com/ngxs/store/pull/1514) and selectors can now be declared in any arbitrary order.

### Inheriting Selectors

When we have states that share similar structure, we can extract the shared selectors into a base class which we can later extend from. If we have an `entities` field on multiple states, we can create a base class containing a dynamic `@Selector()` for that field, and extend from it on the `@State` classes like this.

```ts
export class EntitiesState {
  static getEntities<T>() {
    return createSelector([this], (state: { entities: T[] }) => {
      return state.entities;
    });
  }

  //...
}
```

And extend the `EntitiesState` class on each `@State` like this:

```ts
export interface UsersStateModel {
  entities: User[];
}

@State<UsersStateModel>({
  name: 'users',
  defaults: {
    entities: []
  }
})
@Injectable()
export class UsersState extends EntitiesState {
  //...
}

export interface ProductsStateModel {
  entities: Product[];
}

@State<ProductsStateModel>({
  name: 'products',
  defaults: {
    entities: []
  }
})
@Injectable()
export class ProductsState extends EntitiesState {
  //...
}
```

Then you can use them as follows:

```ts
@Component({ ... })
export class AppComponent {
  users = this.store.selectSignal(UsersState.getEntities<User>());

  products = this.store.selectSignal(ProductsState.getEntities<Product>());

  constructor(private store: Store) {}
}
```
