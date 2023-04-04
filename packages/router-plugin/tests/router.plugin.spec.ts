import { Component, Provider, Type, NgModule, Injectable, NgZone } from '@angular/core';
import { Router, Params, RouterStateSnapshot, RouterModule } from '@angular/router';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';

import { take } from 'rxjs/operators';

import {
  NgxsModule,
  Store,
  Actions,
  ofActionSuccessful,
  State,
  Action,
  StateContext
} from '@ngxs/store';

import {
  NgxsRouterPluginModule,
  RouterState,
  RouterStateSerializer,
  Navigate,
  RouterNavigation
} from '../';

describe('NgxsRouterPlugin', () => {
  it(
    'should select router state',
    freshPlatform(async () => {
      // Arrange
      const injector = await createTestModule();
      const ngZone = injector.get(NgZone);
      const router = injector.get(Router);
      const store = injector.get(Store);

      // Act
      await ngZone.run(() => router.navigateByUrl('/testpath'));

      // Assert
      const routerState = store.selectSnapshot(RouterState.state)!;
      expect(routerState.url).toEqual('/testpath');

      const routerUrl = store.selectSnapshot(RouterState.url);
      expect(routerUrl).toEqual('/testpath');
    })
  );

  it(
    'should handle Navigate action',
    freshPlatform(async () => {
      // Arrange
      const injector = await createTestModule();
      const store = injector.get(Store);

      // Act
      await store.dispatch(new Navigate(['a-path'])).toPromise();

      // Assert
      const routerState = store.selectSnapshot(RouterState.state);
      expect(routerState!.url).toEqual('/a-path');
    })
  );

  it(
    'should select custom router state',
    freshPlatform(async () => {
      // Arrange
      interface RouterStateParams {
        url: string;
        queryParams: Params;
      }

      class CustomRouterStateSerializer implements RouterStateSerializer<RouterStateParams> {
        serialize(state: RouterStateSnapshot): RouterStateParams {
          const {
            url,
            root: { queryParams }
          } = state;
          return { url, queryParams };
        }
      }

      const injector = await createTestModule({
        providers: [{ provide: RouterStateSerializer, useClass: CustomRouterStateSerializer }]
      });

      const store = injector.get(Store);

      // Act
      await store.dispatch(new Navigate(['a-path'], { foo: 'bar' })).toPromise();

      // Assert
      const routerState = store.selectSnapshot(state =>
        RouterState.state<RouterStateParams>(state.router)
      );

      expect(routerState!.url).toEqual('/a-path?foo=bar');
      expect(routerState!.queryParams).toBeDefined();
      expect(routerState!.queryParams.foo).toEqual('bar');
    })
  );

  it(
    'should dispatch `RouterNavigation` event if it was navigated to the same route with query params',
    freshPlatform(async () => {
      // Arrange
      const injector = await createTestModule();

      const actions$ = injector.get(Actions);
      const store = injector.get(Store);

      let count = 0;

      actions$.pipe(ofActionSuccessful(RouterNavigation), take(2)).subscribe(() => {
        count++;
      });

      // Act
      await store
        .dispatch(
          new Navigate(
            ['/route1'],
            {
              a: 10
            },
            {
              queryParamsHandling: 'merge'
            }
          )
        )
        .toPromise();

      await store
        .dispatch(
          new Navigate(
            ['/route1'],
            {
              b: 20
            },
            {
              queryParamsHandling: 'merge'
            }
          )
        )
        .toPromise();

      // Assert
      const routerState = store.selectSnapshot(RouterState.state);
      expect(routerState!.url).toEqual('/route1?a=10&b=20');
      expect(count).toBe(2);
    })
  );

  it(
    'should be possible to access the state snapshot if action is dispatched from the component constructor',
    freshPlatform(async () => {
      // Arrange
      @State({
        name: 'test',
        defaults: null
      })
      @Injectable()
      class TestState {
        constructor(private store: Store) {}

        @Action(TestAction)
        testAction(ctx: StateContext<unknown>) {
          ctx.setState(this.store.selectSnapshot(RouterState.state));
        }
      }

      const injector = await createTestModule({
        states: [TestState]
      });

      const store = injector.get(Store);
      const ngZone = injector.get(NgZone);
      const router = injector.get(Router);

      // Act
      await ngZone.run(() => router.navigateByUrl('/testpath'));

      // Assert
      const state = store.selectSnapshot(TestState);
      expect(state).toBeTruthy();
      expect(state.url).toEqual('/testpath');
    })
  );
});

class TestAction {
  static type = '[Test] Test action';
}

async function createTestModule(
  opts: {
    canActivate?: Function;
    canLoad?: Function;
    providers?: Provider[];
    states?: Type<any>[];
  } = {}
) {
  @Component({
    selector: 'app-root',
    template: '<router-outlet></router-outlet>'
  })
  class AppComponent {}

  @NgModule()
  class TestLazyModule {}

  @Component({
    selector: 'pagea-cmp',
    template: 'pagea-cmp'
  })
  class SimpleComponent {
    constructor(store: Store) {
      store.dispatch(new TestAction());
    }
  }

  @NgModule({
    imports: [
      BrowserModule,
      RouterModule.forRoot(
        [
          { path: '', component: SimpleComponent },
          {
            path: ':id',
            component: SimpleComponent,
            canActivate: ['CanActivateNext']
          },
          {
            path: 'load',
            loadChildren: () => TestLazyModule,
            canLoad: ['CanLoadNext']
          }
        ],
        {
          paramsInheritanceStrategy: 'always'
        }
      ),
      NgxsModule.forRoot(opts.states),
      NgxsRouterPluginModule.forRoot()
    ],
    providers: [
      {
        provide: 'CanActivateNext',
        useValue: opts.canActivate || (() => true)
      },
      {
        provide: 'CanLoadNext',
        useValue: opts.canLoad || (() => true)
      },
      opts.providers || []
    ],
    declarations: [AppComponent, SimpleComponent],
    bootstrap: [AppComponent]
  })
  class TestModule {}

  const { injector } = await skipConsoleLogging(() =>
    platformBrowserDynamic().bootstrapModule(TestModule)
  );

  return injector;
}
