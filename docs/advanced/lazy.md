# Lazy Loaded Stores
Stores can be lazy-loaded easily by importing the `NgxsModule` using the
`forFeature` method. All the other syntax for how you import
and describe them are the same. For example:

```TS
@NgModule({
  imports: [
    NgxsModule.forFeature([LazyState])
  ]
})
export class LazyModule{}
```

It's important to note when lazy-loading a store, it is registered in the global
state so this state object will now be persisted globally. Even though
it's available globally, you should only use it within that feature module so you
make sure not to create dependencies on things that could not be loaded yet.

You probably defined a `AppState` interface that represents the global state
graph but since we lazy loaded this we can't really include that in the definition.
To handle this, let's extend the `AppState` and use that in our a component like:

```TS
export interface AppStateModel {
  zoos: Zoo[];
}

export interface OfficesStateModel extends AppStateModel {
  offices: Office[];
}
```

Now when we use our `Select` in our lazy loaded feature module, we can use `OfficesState`.
