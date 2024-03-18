# Router Plugin

![Router Diagram](../assets/router.png)

In the browser, the location (URL information) and session history
(a stack of locations visited by the current browser tab) are stored in the
global window object. They are accessible via:

- `window.location` ([Location API](https://developer.mozilla.org/en-US/docs/Web/API/Location))
- `window.history` ([History API](https://developer.mozilla.org/en-US/docs/Web/API/History))

Our location data is a dynamic and essential part of the application state-the kind
of state that belongs in a store. Holding it in the store enables devtools luxuries like
time-travel debugging, and easy access from any store-connected component.

This plugin binds that state from the Angular router to our NGXS store.

## Installation

```bash
npm i @ngxs/router-plugin

# or if you are using yarn
yarn add @ngxs/router-plugin

# or if you are using pnpm
pnpm i @ngxs/router-plugin
```

## Usage

When calling `provideStore`, include `withNgxsRouterPlugin` in your app config:

```ts
import { provideStore } from '@ngxs/store';
import { withNgxsRouterPlugin } from '@ngxs/router-plugin';

export const appConfig: ApplicationConfig = {
  providers: [provideStore([], withNgxsRouterPlugin())]
};
```

If you are still using modules, include the `NgxsRouterPluginModule` plugin in your root app module:

```ts
import { NgxsModule } from '@ngxs/store';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';

@NgModule({
  imports: [NgxsModule.forRoot([]), NgxsRouterPluginModule.forRoot()]
})
export class AppModule {}
```

Now the route will be reflected in your store under the `router` state name. The state is represented as a `RouterStateSnapshot` object.

You can also navigate using the store's dispatch method. It accepts the following arguments: `new Navigate(path: any[], queryParams?: Params, extras?: NavigationExtras)`. A simple example would be navigating to the admin page like this:

```ts
import { Store } from '@ngxs/store';
import { Navigate } from '@ngxs/router-plugin';

@Component({ ... })
export class MyApp {
  constructor(private store: Store) {}

  onClick() {
    this.store.dispatch(new Navigate(['/admin']))
  }
}
```

You can use action handlers to listen to state changes in your components and services by subscribing to the `RouterNavigation`, `RouterCancel`, `RouterError` or `RouterDataResolved` action classes.

## Listening to the data resolution event

You can listen for the `RouterDataResolved` action, which is dispatched when the navigated route has linked resolvers. For example:

```ts
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions, ofActionSuccessful } from '@ngxs/store';
import { RouterDataResolved } from '@ngxs/router-plugin';

@Component({ ... })
export class AppComponent {
  constructor() {
    const actions$ = inject(Actions);

    actions$.pipe(
      ofActionSuccessful(RouterDataResolved),
      takeUntilDestroyed()
    ).subscribe((action: RouterDataResolved) => {
      console.log(action.routerState.root.firstChild.data);
    });
  }
}
```

The more explicit example would be a situation where you would want to bind an input property providing some resolved data. For example:

```ts
import { Actions, ofActionSuccessful } from '@ngxs/store';
import { RouterDataResolved } from '@ngxs/router-plugin';

import { map } from 'rxjs';

@Component({
  template: ` <app-some-component [data]="data$ | async"></app-some-component> `
})
export class AppComponent {
  data$ = inject(Actions).pipe(
    ofActionSuccessful(RouterDataResolved),
    map((action: RouterDataResolved) => action.routerState.root.firstChild.data)
  );
}
```

## Custom Router State Serializer

You can implement your own router state serializer to serialize the router snapshot:

```ts
import { Params, RouterStateSnapshot } from '@angular/router';

import { provideStore } from '@ngxs/store';
import { withNgxsRouterPlugin, RouterStateSerializer } from '@ngxs/router-plugin';

export interface RouterStateParams {
  url: string;
  params: Params;
  queryParams: Params;
}

// Map the router snapshot to { url, params, queryParams }
export class CustomRouterStateSerializer implements RouterStateSerializer<RouterStateParams> {
  serialize(routerState: RouterStateSnapshot): RouterStateParams {
    const {
      url,
      root: { queryParams }
    } = routerState;

    let { root: route } = routerState;
    while (route.firstChild) {
      route = route.firstChild;
    }

    const { params } = route;

    return { url, params, queryParams };
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore([], withNgxsRouterPlugin()),
    { provide: RouterStateSerializer, useClass: CustomRouterStateSerializer }
  ]
};
```

Or with the module approach:

```ts
import { NgxsModule } from '@ngxs/store';
import { NgxsRouterPluginModule, RouterStateSerializer } from '@ngxs/router-plugin';

@NgModule({
  imports: [NgxsModule.forRoot([]), NgxsRouterPluginModule.forRoot()],
  providers: [{ provide: RouterStateSerializer, useClass: CustomRouterStateSerializer }]
})
export class AppModule {}
```

## Configuration

The `RouterNavigation` action is dispatched before guards and resolvers are run by default. Therefore the action handler may run too soon due to a navigation cancel by any guard or resolver. The `RouterNavigation` action may be run after all guards and resolvers by providing the `navigationActionTiming` configuration property:

```ts
import { provideStore } from '@ngxs/store';
import { withNgxsRouterPlugin, NavigationActionTiming } from '@ngxs/router-plugin';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(
      [],
      withNgxsRouterPlugin({
        navigationActionTiming: NavigationActionTiming.PostActivation
      })
    )
  ]
};
```

Or with the module approach:

```ts
import { NgxsModule } from '@ngxs/store';
import { NgxsRouterPluginModule, NavigationActionTiming } from '@ngxs/router-plugin';

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsRouterPluginModule.forRoot({
      navigationActionTiming: NavigationActionTiming.PostActivation
    })
  ]
})
export class AppModule {}
```
