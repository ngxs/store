# Life-cycle

States can implement life-cycle events.

## `ngxsOnChanges`

If a state implements the NgxsOnChanges interface, its ngxsOnChanges method respond when (re)sets state. The states' ngxsOnChanges methods are invoked in a topological sorted order going from parent to child. The first parameter is the NgxsSimpleChange object of current and previous state.

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
export class ZooState implements NgxsOnChanges {
  ngxsOnChanges(change: NgxsSimpleChange) {
    console.log('prev state', change.previousValue);
    console.log('next state', change.currentValue);
  }
}
```

## `ngxsOnInit`

If a state implements the `NgxsOnInit` interface, its `ngxsOnInit` method will be invoked after
all the states from the state's module definition have been initialized and pushed into the state stream.
The states' `ngxsOnInit` methods are invoked in a topological sorted order going from parent to child.
The first parameter is the `StateContext` where you can get the current state and dispatch actions as usual.

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
export class ZooState implements NgxsOnInit {
  ngxsOnInit(ctx: StateContext<ZooStateModel>) {
    console.log('State initialized, now getting animals');
    ctx.dispatch(new GetAnimals());
  }
}
```

## `ngxsAfterBootstrap`

If a state implements the `NgxsAfterBootstrap` interface, its `ngxsAfterBootstrap` method will be invoked after the root view and all its children have been rendered, because Angular invokes functions, retrieved from the injector by `APP_BOOTSTRAP_LISTENER` token, only after creating and attaching `ComponentRef` of the root component to the tree of views.

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
export class ZooState implements NgxsAfterBootstrap {
  ngxsAfterBootstrap(ctx: StateContext<ZooStateModel>) {
    console.log('The application has been fully rendered');
    ctx.dispatch(new GetAnimals());
  }
}
```

## Lifecycle sequence

After creating the state by calling its constructor, NGXS calls the lifecycle hook methods in the following sequence at specific moments:

| Hook                 | Purpose and Timing                                                        |
| -------------------- | ------------------------------------------------------------------------- |
| ngxsOnChanges()      | Called before ngxsOnInit() and whenever state change.                     |
| ngxsOnInit()         | Called once, after the first ngxsOnChanges().                             |
| ngxsAfterBootstrap() | Called once, after the root view and all its children have been rendered. |

## Feature Modules Order of Imports

If you have feature modules they need to be imported after the root module:

```ts
// feature.module.ts
@NgModule({
  imports: [NgxsModule.forFeature([FeatureState])]
})
export class FeatureModule {}

// app.module.ts
@NgModule({
  imports: [NgxsModule.forRoot([]), FeatureModule]
})
export class AppModule {}
```

## APP_INITIALIZER Stage

### Theoretical Introduction

The `APP_INITIALIZER` is just a token that references Promise factories. If you've ever used the `APP_INITIALIZER` token, then you are already familiar with its syntax:

```ts
export function appInitializerFactory() {
  return () => Promise.resolve();
}

@NgModule({
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      multi: true
    }
  ]
})
export class AppModule {}
```

This token is injected into `ApplicationInitStatus` class. What does Angular do under the hood? It gets an instance of this class and invokes the `runInitializers` method:

```ts
const initStatus = moduleRef.injector.get(ApplicationInitStatus);
initStatus.runInitializers();
```

All that it does inside this method is looping via the `APP_INITIALIZER` array (as it's a `multi` token) and invoking those factories, that you've provided in `useFactory` properties:

```ts
for (let i = 0; i < this.appInits.length; i++) {
  const initResult = this.appInits[i]();
  if (isPromise(initResult)) {
    asyncInitPromises.push(initResult);
  }
}
```

Then `asyncInitPromises` are provided into `Promise.all`. That's all the magic. That's why the `bootstrapModule` returns a `Promise`:

```ts
platformBrowser()
  .bootstrapModule(AppModule)
  .then(() => {
    console.log('Hey there!');
  });
```

### APP_INITIALIZER and NGXS

Everything that we examined earlier is very important, because from this comes the fact that `APP_INITIALIZER` is resolved after NGXS states are initialized. They are initialized by the `NgxsModule` that is imported into the `AppModule`. The `ngxsOnInit` method on states is also invoked before the `APP_INITIALIZER` token is resolved. Given the following code:

```ts
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private version: string | null = null;

  constructor(private http: HttpClient) {}

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
export class VersionState implements NgxsOnInit {
  constructor(private configService: ConfigService) {}

  ngxsOnInit(ctx: StateContext<string | null>) {
    ctx.setState(this.configService.getVersion());
  }
}

export function appInitializerFactory(configService: ConfigService) {
  return () => configService.loadVersion().toPromise();
}

@NgModule({
  imports: [NgxsModule.forRoot([VersionState])],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      multi: true,
      deps: [ConfigService]
    }
  ]
})
export class AppModule {}
```

The above example is used only for demonstration purposes! This code will throw an error because the `getVersion` method is invoked before the `version` property is set. Why? Because the `ngxsOnInit` methods on states are invoked before the `APP_INITIALIZER` is invoked!

### Solution

There are different solutions. Let's look at the simplest. The first solution would be to use the `ngxsAfterBootstrap` method:

```ts
@State<string | null>({
  name: 'version',
  defaults: null
})
export class VersionState implements NgxsAfterBootstrap {
  constructor(private configService: ConfigService) {}

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
export class VersionState {
  @Action(SetVersion)
  setVersion(ctx: StateContext<string | null>, action: SetVersion): void {
    ctx.setState(action.version);
  }
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  constructor(private http: HttpClient, private store: Store) {}

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

In conclusion, do not try to access any data in state constructors or `ngxsOnInit` methods that is fetched during the `APP_INITIALIZER` stage.
