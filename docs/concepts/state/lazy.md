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

## `lazyProvider`

The `lazyProvider` function is designed to defer the registration of Angular providers until they are explicitly needed — such as when navigating to a route or triggering a guard. This is particularly useful for feature state libraries, where including providers in multiple locations could cause them to be unintentionally bundled into the initial application bundle.

```ts
import { lazyProvider } from '@ngxs/store';

const routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
    canActivate: [
      lazyProvider(async () => (await import('path-to-state-library')).invoicesStateProvider)
    ]
  }
];
```

Exporting a provider:

```ts
// path-to-state-library/index.ts
export const invoicesStateProvider = provideStates([InvoicesState]);
```

It also supports `default` exports, which are common in dynamically imported ES modules. If the imported provider is wrapped in a default property (e.g., `export default invoicesStateProvider`), the function will automatically unwrap and register it.

```ts
// In routes
lazyProvider(() => import('path-to-state-library'));

// path-to-state-library/index.ts
const invoicesStateProvider = provideStates([InvoicesState]);
export default invoicesStateProvider;
```
