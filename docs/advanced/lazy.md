# Lazy Loaded Stores
Stores can be lazy-loaded easily by importing the `NgxsModule` using the
`forFeature` method. All the other syntax for how you import
and describe them are the same. For example:

```javascript
@NgModule({
  imports: [
    NgxsModule.forFeature([LazyStore])
  ]
})
export class LazyModule{}
```

Its important to note when you lazy load a store, it is registered in the global
state so this state object will be persisted globally now. Even though
its available globally, you should only use it within that feature module so you
make sure not to create depedencies on things that could not be loaded yet.
