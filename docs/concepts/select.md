# Selects
Selects are functions that slice a specific portion of state from the global state container.

In CQRS and Redux patterns, we keep READ and WRITE separated. This pattern also exists in NGXS.
When we want to read data out of our store, we use a select operator to retrieve this data.

In NGXS, there are two methods to select state, we can either call the `select` method on the
`Store` service or use the `@Select` decorator. First let's look at the `@Select` decorator.

## Select Decorators
You can select slices of data from the store using the `@Select` decorator. It has a few
different ways to get your data out, whether passing the state class, a function, a different state class
or a memoized selector.

```TS
import { Select } from '@ngxs/store';
import { ZooState, ZooStateModel } from './zoo.state';

@Component({ ... })
export class ZooComponent {
  // Reads the name of the state from the state class
  @Select(ZooState) animals$: Observable<string[]>;

  // Uses the pandas memoized selector to only return pandas
  @Select(ZooState.pandas) pandas$: Observable<string[]>;

  // Also accepts a function like our select method
  @Select(state => state.zoo.animals) animals$: Observable<string[]>;

  // Reads the name of the state from the parameter
  @Select() zoo$: Observable<ZooStateModel>;
}
```

## Store Select Function
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

## Snapshot Selects
On the store, there is a `selectSnapshot` function that allows you to pull out the
raw value. This is helpful for cases where you need to get a static value but can't
use Observables. A good use case for this would be an interceptor that needs to get
the token from the auth state.

```TS
@Injectable()
export class JWTInterceptor implements HttpInterceptor {

  constructor(private store: Store) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.store.selectSnapshot<string>((state: AppState) => state.auth.token);
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

```TS
import { State, Selector } from '@ngxs/store';

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

Notice, the `state` is just the local state for this `ZooState` class. Now in our component,
we simply do:

```TS
@Component({...})
export class AppComponent {
  @Select(ZooState.pandas) pandas$: Observable<string[]>;
}
```

and our `pandas$` will only return animals with the name panda in them.

### Selector Options

The behavior of the memoised selectors can be configured at a global level using the `selectorOptions` property in the options passed to the `NgxsModule.forRoot` call (see [Options](../advanced/options.md)).  
These options can also be provided through the `@SelectorOptions` decorator at a Class or Method level in order to configure the behavior of selectors within that scope. The following options are available:
#### `suppressErrors`
- `true` will cause any error within a selector to result in the selector returning `undefined`.
- `false` results in these errors propagating through the stack that triggered the evaluation of the selector that caused the error.
- **NOTE:** _The default for this setting will be changing to `false` in NGXS v4.  
The default value in NGXS v3.x is `true`._

#### `injectContainerState`
- `true` will cause all selectors defined within a state class to receive the container class' state model as their first parameter. As a result every selector would be re-evaluated after any change to that state.  
**NOTE:** *This is not ideal, therefore this setting default will be changing to `false` in NGXS v4.* 
- `false` will prevent the injection of the container state model as the first parameter of a selector method (defined within a state class) that joins to other selectors for its parameters.
- *The default value in NGXS v3.x is `true`.*
- See [here](#joining-selectors) for examples of the effect this setting has on your selectors.

We recommend setting these options at the global level, unless you are transitioning your application from one behavior to another where you can use this decorator to introduce this transition in a piecemeal fashion. For example, NGXS v4 will be introducing a change to the selectors that will effect methods which make use of joined selectors (see [below](#joining-selectors)).

We recommend using the following global settings for new projects in order to minimise the impact of the v4 upgrade:
```TS
{
  // These Selector Settings are recommended in preparation for NGXS v4
  // (See above for their effects)
  suppressErrors: false,
  injectContainerState: false
}
```

### Memoized Selectors with Arguments

Selectors can be configured to accept arguments.  
There are two patterns that allow for this: [Lazy Selectors](#lazy-selectors) or [Dynamic Selectors](#dynamic-selectors)

#### Lazy Selectors

To create a lazy selector all that you need to do is return a function from the selector.
The function returned by the selector will be memoized automatically and the logic inside this function will be evaluated at a later stage when the consumer of the selector executes the function. Note that this function can take any number of arguments (or zero arguments) as it is the consumer's responsibility to supply them.

For instance, I can have a Lazy Selector that will filter my pandas to the provided type of panda.

```TS
@State<string[]>({
  name: 'animals',
  defaults: []
})
export class ZooState {

  @Selector()
  static pandas(state: string[]) {
    return (type: string) => {
      return state
        .filter(s => s.indexOf('panda') > -1)
        .filter(s => s.indexOf(type) > -1);
    };
  }

}
```

then you can use `store.select` and evaluate the lazy function using the `rxjs` `map` pipeline function.

```TS
import { Store } from '@ngxs/store';
import { map } from 'rxjs/operators';

@Component({ ... })
export class ZooComponent {
  babyPandas$: Observable<string[]>;

  constructor(private store: Store) {
    this.babyPandas$ = this.store
      .select(ZooState.pandas)
      .pipe(map(filterFn => filterFn('baby')));
  }
}
```

#### Dynamic Selectors

A dynamic selector is created by using the `createSelector` function as opposed to the `@Selector` decorator. It does not need to be created in any special area at any specific time. The typical use case though would be to create a selector that looks like a normal selector but takes an argument to provide to the dynamic selector.

For instance, I can have a Dynamic Selector that will filter my pandas to the provided type of panda.

```TS
@State<string[]>({
  name: 'animals',
  defaults: []
})
export class ZooState {

  static pandas(type: string) {
    return createSelector(
      [ZooState],
      (state: string[]) => {
        return state
          .filter(s => s.indexOf('panda') > -1)
          .filter(s => s.indexOf(type) > -1);
      }
    );
  }

}
```

then you can use `@Select` to call this function with the parameter provided.

```TS
import { Store } from '@ngxs/store';
import { map } from 'rxjs/operators';

@Component({ ... })
export class ZooComponent {

  @Select(ZooState.pandas('baby'))
  babyPandas$: Observable<string[]>;

  @Select(ZooState.pandas('adult'))
  adultPandas$: Observable<string[]>;

}
```

Note that each of these selectors have their own separate memoization. Even if two dynamic selectors created in this way are provided the same argument, they will have separate memoization.

These selectors are extremely powerful and are what is used under the hood to create all other selectors.

_Dynamic Selectors (dynamic state slice)_

An interesting use case would be to allow for a selector to be reused to select from States that have the same structure. For example:

```TS
export class SharedSelectors {

  static getEntities(stateClass) {
    return createSelector([stateClass], (state: { entities: any[] }) => {
      return state.entities;
    });
  }

}
```

then this could be used as follows:

```TS

@Component({ ... })
export class ZooComponent {
  
  @Select(SharedSelectors.getEntities(ZooState))
  zoos$: Observable<Zoo[]>;

  @Select(SharedSelectors.getEntities(ParkState))
  parks$: Observable<Park[]>;

}
```

### Joining Selectors
When defining a selector, you can also pass other selectors into the signature
of the `Selector` decorator to join other selectors with this state selector.

If you do not change the Selector Options (see [above](#selector-options)) then these selectors will have the following signature in NGXS v3.x:
```TS
@State<PreferencesStateModel>({ ... })
export class PreferencesState { ... }

@State<string[]>({ ... })
export class ZooState {

  @Selector([PreferencesState])
  static firstLocalPanda(state: string[], preferencesState: PreferencesStateModel) {
    return state.find(
      s => s.indexOf('panda') > -1 && s.indexOf(preferencesState.location)
    );
  }

  @Selector([ZooState.firstLocalPanda])
  static happyLocalPanda(state: string[], panda: string) {
    return 'happy ' + panda;
  }

}
```

Here you can see that when using the `Selector` decorator with arguments within a state class, it will inject the state class's state model as the first parameter followed by the other selectors in the order they were passed in the signature. This is the behavior provided by the [`injectContainerState`](#injectcontainerstate) option being defaulted to `true` in NGXS v3.x.

The Memoised Selectors will recalculate when any of their input parameter values change (whether they use them or not). In the case of the behavior above where the state class's state model is injected as the first input parameter, the selectors will recalculate on any change to this model. You will notice that the `happyLocalPanda` selector has the `state` dependency even though it is not used. It would recalculate on every change to `state` ignoring the fact that `firstLocalPanda` value may not have changed. This is not ideal, therefore this default behavior is changing in NGXS v4.

In NGXS v4 and above the default value of the [`injectContainerState`](#injectcontainerstate) selector option will change to `false`, resulting in selectors that are more optimised because they do not get the state model injected as the first parameter unless explicitly requested. With this setting the selectors would need to be defined as follows:
 ```TS
@State<PreferencesStateModel>({ ... })
export class PreferencesState { ... }

@State<string[]>({ ... })
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
Now the `happyLocalPanda` will only recalculate when the output value of the `firstLocalPanda` selector changes.

We recommend that you move your projects to this behavior in order to optimize your selectors and to prepare for the change to the defaults coming in NGXS v4. See the Selector Options section [above](#selector-options) for the recommended settings.

### Meta Selectors
By default selectors in NGXS are bound to a state. Sometimes you need the ability
to join to un-related states in a high-performance re-usable fashion. A meta selector
is a selector allows you to bind N number of selectors together to return a state
stream.

Let's say we have 2 states; 'zoos' and 'theme parks'. We have a component that needs
to show all the zoos and theme parks for a given city. These are two very distinct
state classes that are likely not related in any manner. We can use a meta selector
to join these two states together like:

```TS
export class CityService {

  @Selector([Zoo, ThemePark])
  static zooThemeParks(zoos, themeParks) {
    return [
      ...zoos,
      ...themeParks
    ];
  }

}
```

now we can use this `zooThemeParks` selector anywhere in our application.

### The Order of Interacting Selectors
This topic may be helpful for those users who keep their selectors in separate classes. Let's look at the code below:
```ts
// counter.state.ts
export interface CounterStateModel {
  counter: number;
}

@State<CounterStateModel>({
  name: 'counter',
  defaults: {
    counter: 0
  }
})
export class CounterState {}

// counter.query.ts
export class CounterQuery {

  @Selector([CounterQuery.getCounter])
  static getCounterCube(counter: number): number {
    return counter ** 3;
  }

  // Note: this selector being declared after its usage will cause an issue!!!
  @Selector([CounterState])
  static getCounter(state: CounterStateModel): number {
    return state.counter;
  }

  @Selector([CounterQuery.getCounter])
  static getCounterSquare(counter: number): number {
    return counter ** 2;
  }

}
```

As you see in the code above there is a reusable selector `getCounter` that returns the `counter` property from the whole state. The `getCounter` selector is used by 2 other selectors `getCounterSquare` and `getCounterCube`. The snag lies in the `getCounterCube` selector because it's declared before the `getCounter` selector. Let's look at the code emitted by the TypeScript compiler:
```ts
__decorate([Selector([CounterQuery.getCounter])], CounterQuery, 'getCounterCube', null);
__decorate([Selector([CounterState])], CounterQuery, 'getCounter', null);
__decorate([Selector([CounterQuery.getCounter])], CounterQuery, 'getCounterSquare', null);
```

The `@Selector` decorator tries to access the `getCounter` selector that hasn't been decorated yet. How could we fix it? We have to change the order of selectors:
```ts
export class CounterQuery {

  @Selector([CounterState])
  static getCounter(state: CounterStateModel): number {
    return state.counter;
  }

  @Selector([CounterQuery.getCounter])
  static getCounterCube(counter: number): number {
    return counter ** 3;
  }

  @Selector([CounterQuery.getCounter])
  static getCounterSquare(counter: number): number {
    return counter ** 2;
  }

}
```

Another solution could be the usage of the `createSelector` function rather than changing the order:
```ts
export class CounterQuery {

  static getCounterCube() {
    return createSelector(
      [CounterQuery.getCounter()],
      (counter: number) => counter ** 3
    );
  }

  static getCounter() {
    return createSelector(
      [CounterState],
      (state: CounterStateModel) => state.counter
    );
  }

  static getCounterSquare() {
    return createSelector(
      [CounterQuery.getCounter()],
      (counter: number) => counter ** 2
    );
  }

}

```

### Inheriting Selectors

When we have states that share similar structure, we can extract the shared selectors into a base class which we can later extend from. If we have an `entities` field on multiple states, we can create a base class containing a dynamic `@Selector()` for that field, and extend from it on the `@State` classes like this.

```TS
export class EntitiesState {

  static entities<T>() :T[] {
    return createSelector([this], (state: { entities: T[] }) => {
      return state.entities;
    });
  }

  //...

}
```

And extend the `EntitiesState` class on each `@State` like this:

```TS
export interface UsersStateModel {
  entities: User[];
}

@State<UsersStateModel>({
  name: 'users',
  defaults: {
    entities: []
  }
})
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
export class ProductsState extends EntitiesState {
  //...
}
```

Then you can use them as follows:

```TS

@Component({ ... })
export class AppComponent {

  @Select(UsersState.entities<User>())
  users$: Observable<User[]>;

  @Select(ProductsState.entities<Product>())
  products$: Observable<Product[]>;

}
```

Or: 

```TS
this.store.select(UsersState.entities<User>())
```

## Special Considerations

### Angular Libraries: Use of lambdas in static functions

_If you are building an Angular lib directly so that it can be deployed to npm the Angular compiler option `strictMetadataEmit` (see [docs](https://angular.io/guide/aot-compiler#strictmetadataemit)) will most likely be set to true and, as a result, Angular's `MetadataCollector` from the `@angular/compiler-cli` package will report the following issue with using lambdas in static methods:_

>  Metadata collected contains an error that will be reported at runtime: Lambda not supported.`

This error would be reported for each of the selectors defined below but, as demonstrated in the sample, you can prevent this by including the `// @dynamic` comment before the class expression and decorators:

```TS
// @dynamic
@State<string[]>({
  name: 'animals',
  defaults: [
    'panda',
    'horse',
    'bee'
  ]
})
export class ZooState {

  @Selector()
  static pandas(state: string[]) {
    return state.filter(s => s.indexOf('panda') > -1);
  }

  @Selector()
  static horses(state: string[]) {
    return (type: string) => {
      return state
        .filter(s => s.indexOf('horse') > -1)
        .filter(s => s.indexOf(type) > -1);
    };
  }

  static bees(type: string) {
    return createSelector(
      [ZooState],
      (state: string[]) => {
        return state
          .filter(s => s.indexOf('bee') > -1)
          .filter(s => s.indexOf(type) > -1);
      }
    );
  }

}
```

As an alternative you can assign your result to a variable before you return it:  
See https://github.com/ng-packagr/ng-packagr/issues/696#issuecomment-387114613
```TS
@State<string[]>({
  name: 'animals',
  defaults: [
    'panda',
    'horse',
    'bee'
  ]
})
export class ZooState {

  @Selector()
  static pandas(state: string[]) {
    const result = state.filter(s => s.indexOf('panda') > -1);
    return result;
  }

  @Selector()
  static horses(state: string[]) {
    const fn = (type: string) => {
      return state
        .filter(s => s.indexOf('horse') > -1)
        .filter(s => s.indexOf(type) > -1);
    };
    return fn;
  }

  static bees(type: string) {
    const selector = createSelector(
      [ZooState],
      (state: string[]) => {
        return state
          .filter(s => s.indexOf('bee') > -1)
          .filter(s => s.indexOf(type) > -1);
      }
    );
    return selector;
  }

}
```
