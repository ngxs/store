# Life-cycle
States can implement life-cycle events.

## `ngxsOnInit`
If a state implements the `NgxsOnInit` interface, its `ngxsOnInit` method will be invoked after
all the states from the state's module definition have been initialized and pushed into the state stream.
The states' `ngxsOnInit` methods are invoked in a topological sorted order going from parent to child.
The first parameter is the `StateContext` where you can get the current state and dispatch actions as usual.

```TS
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

```TS
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

### Feature modules order of imports

If you have feature modules they need to be imported after the root module:

```TS
// feature.module.ts
@NgModule({
  imports: [
    NgxsModule.forFeature([FeatureState])
  ]
})
export class FeatureModule{}

// app.module.ts
@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    FeatureModule,
  ]
})
export class AppModule {}
```
