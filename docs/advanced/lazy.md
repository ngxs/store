# Lazy Loaded States

States can be easily lazy-loaded by adding the `provideStates` function to the `Route` providers:

```ts
import { provideStates } from '@ngxs/store';

export const routes: Routes = [
  {
    path: '',
    component: AnimalsComponent,
    providers: [provideStates([AnimalsState])]
  }
];
```

If you are still using modules, you can import the `NgxsModule` using the `forFeature` method:

```ts
@NgModule({
  imports: [NgxsModule.forFeature([AnimalsState])]
})
export class LazyModule {}
```

It's important to note that when lazy-loading a state, it is registered in the global state, meaning this state object will now be persisted globally. Even though it's available globally, you should only use it within that feature component to ensure you don't create dependencies on things that may not be loaded yet.

How are feature states added to the global state graph? Assume you have a `ZoosState`:

```ts
@State<Zoo[]>({
  name: 'zoos',
  defaults: []
})
@Injectable()
export class ZoosState {}
```

And it's registered at the root level via `provideStore([ZoosState])`. Assume you've got a feature `offices` state:

```ts
@State<Office[]>({
  name: 'offices',
  defaults: []
})
@Injectable()
export class OfficesState {}
```

After the route is loaded and its providers are initialized, the global state will have the following signature if you register this state in some lazy-loaded component via `provideStates([OfficesState])`:

```ts
{
  zoos: [],
  offices: []
}
```

You can try it yourself by invoking `store.snapshot()` and printing the result to the console before and after the lazy component is loaded.
