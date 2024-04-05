# Life-cycle

States can implement life-cycle events.

## `ngxsOnChanges`

If a state implements the `NgxsOnChanges` interface, its `ngxsOnChanges` method responds when the state is (re)set.

The `ngxsOnChanges` methods of states are invoked in a topologically sorted order, going from parent to child states. Within these methods, the first parameter is the `NgxsSimpleChange` object containing the current and previous states.

```ts
export interface ZooStateModel {
  animals: string[];
}

@State<ZooStateModel>({
  name: 'zoo',
  defaults: {
    animals: []
  }
})
@Injectable()
export class ZooState implements NgxsOnChanges {
  ngxsOnChanges(change: NgxsSimpleChange) {
    console.log('prev state', change.previousValue);
    console.log('next state', change.currentValue);
  }
}
```

## `ngxsOnInit`

If a state implements the `NgxsOnInit` interface, its `ngxsOnInit` method is invoked after the `InitState` or `UpdateState` action has been handled, depending on where the state is registered (root or feature). If your state is provided at the root level, its `ngxsOnInit` may be called immediately once the `ENVIRONMENT_INITIALIZER` token is resolved. However, it may also be called asynchronously if you handle the `InitState` action and have some asynchronous logic.

The `ngxsOnInit` methods of states are invoked in a topologically sorted order, going from parent to child states. Within these methods, the first parameter is the `StateContext`, which allows you to access the current state and dispatch actions as usual.

```ts
export interface ZooStateModel {
  animals: string[];
}

@State<ZooStateModel>({
  name: 'zoo',
  defaults: {
    animals: []
  }
})
@Injectable()
export class ZooState implements NgxsOnInit {
  ngxsOnInit(ctx: StateContext<ZooStateModel>) {
    console.log('State initialized, now getting animals');
    ctx.dispatch(new GetAnimals());
  }
}
```

## `ngxsAfterBootstrap`

If a state implements the `NgxsAfterBootstrap` interface, its `ngxsAfterBootstrap` method will be bound to the `APP_BOOTSTRAP_LISTENER`, which is resolved after the app has been bootstrapped.

```ts
export interface ZooStateModel {
  animals: string[];
}

@State<ZooStateModel>({
  name: 'zoo',
  defaults: {
    animals: []
  }
})
@Injectable()
export class ZooState implements NgxsAfterBootstrap {
  ngxsAfterBootstrap(ctx: StateContext<ZooStateModel>) {
    console.log('The application has been fully rendered');
    ctx.dispatch(new GetAnimals());
  }
}
```

## Lifecycle sequence

After creating the state by calling its constructor, NGXS calls the lifecycle hook methods in the following sequence at specific moments:

| Hook                 | Purpose and Timing                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------------- |
| ngxsOnChanges()      | Called _before_ `ngxsOnInit()` and whenever state changes.                                               |
| ngxsOnInit()         | Called _once_, after the _first_ `ngxsOnChanges()` and _before_ the `APP_INITIALIZER` token is resolved. |
| ngxsAfterBootstrap() | Called _once_, after the root view and all its children have been rendered.                              |

## Feature States Order of Imports

If you have feature states they need to be registered after the root `provideStore` has been called:

```ts
// some-data-access-library/index.ts
export function provideDataAccessInvoiceLines() {
  return provideStates([InvoiceLinesState]);
}

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [provideStore(), provideDataAccessInvoiceLines()]
};
```

## APP_INITIALIZER Stage

### Theoretical Introduction

The `APP_INITIALIZER` is just a token that references Promise factories. If you've ever used the `APP_INITIALIZER` token, then you are already familiar with its syntax:

```ts
export function appInitializerFactory() {
  return () => Promise.resolve();
}

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      multi: true
    }
  ]
};
```

Please refer to [this guide](https://angular.io/api/core/APP_INITIALIZER) to familiarize yourself with its functionality.

### APP_INITIALIZER and NGXS

The `APP_INITIALIZER` token is resolved after NGXS states are registered. This is because they are registered during the resolution of the `ENVIRONMENT_INITIALIZER` token. Additionally, the `ngxsOnInit` method on states is invoked before the `APP_INITIALIZER` token is resolved. Given the following code:

```ts
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private version: string | null = null;

  private http = inject(HttpClient);

  loadVersion(): Observable<string> {
    return this.http.get<string>('/api/version').pipe(
      tap(version => {
        this.version = version;
      })
    );
  }

  getVersion(): never | string {
    if (this.version === null) {
      throw new Error('"version" is not available yet!');
    }

    return this.version;
  }
}

@State<string | null>({
  name: 'version',
  defaults: null
})
@Injectable()
export class VersionState implements NgxsOnInit {
  private configService = inject(ConfigService);

  ngxsOnInit(ctx: StateContext<string | null>) {
    ctx.setState(this.configService.getVersion());
  }
}

export function appInitializerFactory() {
  const configService = inject(ConfigService);
  return () => configService.loadVersion();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore([VersionState]),

    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      multi: true
    }
  ]
};
```

The example provided is for demonstration purposes and will throw an error because the `version` is not set yet. This occurs because `getVersion` is called before the version is loaded.

### Solution

There are different solutions. Let's look at the simplest. The first solution would be to use the `ngxsAfterBootstrap` method:

```ts
@State<string | null>({
  name: 'version',
  defaults: null
})
@Injectable()
export class VersionState implements NgxsAfterBootstrap {
  private configService = inject(ConfigService);

  ngxsAfterBootstrap(ctx: StateContext<string | null>) {
    ctx.setState(this.configService.getVersion());
  }
}
```

The second solution would be dispatching some `SetVersion` action right after the version is fetched:

```ts
export class SetVersion {
  static readonly type = '[Version] Set version';

  constructor(public version: string) {}
}

@State<string | null>({
  name: 'version',
  defaults: null
})
@Injectable()
export class VersionState {
  @Action(SetVersion)
  setVersion(ctx: StateContext<string | null>, action: SetVersion): void {
    ctx.setState(action.version);
  }
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private http = inject(HttpClient);
  private store = inject(Store);

  loadVersion() {
    return this.http.get<string>('/api/version').pipe(
      tap(version => {
        this.store.dispatch(new SetVersion(version));
      })
    );
  }
}
```

### Summary

In conclusion, the `ngxsOnInit` method is useful when you need to set some calculated values on the state with access to dependency injection within the state class, but before the app is bootstrapped. This allows components to pick up available data.
