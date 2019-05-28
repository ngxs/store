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
export class LazyModule {}
```

It's important to note when lazy-loading a store, it is registered in the global
state so this state object will now be persisted globally. Even though
it's available globally, you should only use it within that feature module so you
make sure not to create dependencies on things that could not be loaded yet.

How are feature states added to the global state graph? Assume you've got a `ZoosState`:

```TS
@State<Zoo[]>({
  name: 'zoos',
  defaults: []
})
export class ZoosState {}
```

And it's registered in the root module via `NgxsModule.forRoot([ZoosState])`. Assume you've got a feature `offices` state:

```TS
@State<Office[]>({
  name: 'offices',
  defaults: []
})
export class OfficesState {}
```

You register this state is some lazy-loaded module via `NgxsModule.forFeature([OfficesState])`. After the lazy module is loaded - the global state will have such signature:

```TS
{
  zoos: [],
  offices: []
}
```

You can try it yourself by invoking `store.snapshot()` and printing the result to the console before and after the lazy module is loaded. .
