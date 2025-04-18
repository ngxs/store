import { Component, NgModule, ErrorHandler } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import {
  Router,
  RouterModule,
  Resolve,
  NavigationError,
  NavigationEnd
} from '@angular/router';
import {
  ofActionDispatched,
  Actions,
  Store,
  provideStore,
  DispatchOutsideZoneNgxsExecutionStrategy
} from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { filter } from 'rxjs/operators';

import { createNgxsRouterPluginTestingPlatform } from './helpers';
import {
  RouterNavigation,
  RouterState,
  Navigate,
  NavigationActionTiming,
  NgxsRouterPluginOptions,
  withNgxsRouterPlugin
} from '../';

describe('RouterNavigation', () => {
  class ErrorSupressor implements ErrorHandler {
    handleError() {}
  }

  class ErrorResolver implements Resolve<void> {
    async resolve(): Promise<void> {
      throw Error();
    }
  }

  class SuccessResolver implements Resolve<void> {
    async resolve(): Promise<void> {
      return;
    }
  }

  @Component({
    selector: 'app-root',
    template: '<router-outlet></router-outlet>',
    standalone: false
  })
  class RootComponent {}

  @Component({
    selector: 'home',
    template: '',
    standalone: false
  })
  class HomeComponent {}

  @Component({
    selector: 'error',
    template: '',
    standalone: false
  })
  class ErrorComponent {}

  @Component({
    selector: 'success',
    template: '',
    standalone: false
  })
  class SuccessComponent {}

  function getTestModule(options?: NgxsRouterPluginOptions) {
    @NgModule({
      imports: [
        BrowserModule,
        // Resolvers are not respected if we're using `RouterTestingModule`
        // see https://github.com/angular/angular/issues/15779
        // to be sure our data is resolved - we have to use native `RouterModule`
        RouterModule.forRoot([
          {
            path: '',
            component: HomeComponent
          },
          {
            path: 'error',
            component: ErrorComponent,
            resolve: {
              error: ErrorResolver
            }
          },
          {
            path: 'success',
            component: SuccessComponent,
            resolve: {
              success: SuccessResolver
            }
          }
        ])
      ],
      declarations: [RootComponent, HomeComponent, ErrorComponent, SuccessComponent],
      bootstrap: [RootComponent],
      providers: [
        provideStore(
          [],
          {
            executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy
          },
          withNgxsRouterPlugin(options)
        ),
        ErrorResolver,
        SuccessResolver,
        { provide: APP_BASE_HREF, useValue: '/' },
        {
          provide: ErrorHandler,
          useClass: ErrorSupressor
        }
      ]
    })
    class TestModule {}
    return TestModule;
  }

  describe('when route guards and resolvers succeed', () => {
    it(
      'should wait for `NavigationEnd` and then dispatch the `RouterNavigation` action',
      freshPlatform(async () => {
        // Arrange
        const { injector } = await skipConsoleLogging(() =>
          platformBrowserDynamic().bootstrapModule(getTestModule())
        );
        const actions$: Actions = injector.get(Actions);
        const router: Router = injector.get(Router);
        const store: Store = injector.get(Store);

        let navigationEndEmittedTimes = 0;
        let routerNavigationDispatchedTimes = 0;

        const subscription = router.events
          .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
          .subscribe(() => {
            navigationEndEmittedTimes++;
          });

        actions$.pipe(ofActionDispatched(RouterNavigation)).subscribe(() => {
          routerNavigationDispatchedTimes++;
        });

        // Act
        await store.dispatch(new Navigate(['/success'])).toPromise();
        subscription.unsubscribe();

        // Assert
        expect(navigationEndEmittedTimes).toBe(1);
        expect(routerNavigationDispatchedTimes).toBe(1);
      })
    );
  });

  describe('when route guard succeeds and route resolver fails', () => {
    it(
      'should persist the previous state and dispatch the `RouterNavigation` action if the timing is PreActivation',
      freshPlatform(async () => {
        // Arrange
        const { router, store, actions$ } = await createNgxsRouterPluginTestingPlatform(
          getTestModule({ navigationActionTiming: NavigationActionTiming.PreActivation })
        );
        const initialUrl = store.selectSnapshot(RouterState.url);
        let navigationErrorEmittedTimes = 0;
        let routerNavigationDispatchedTimes = 0;
        router.events
          .pipe(filter((event): event is NavigationError => event instanceof NavigationError))
          .subscribe(() => {
            navigationErrorEmittedTimes++;
          });
        actions$.pipe(ofActionDispatched(RouterNavigation)).subscribe(() => {
          routerNavigationDispatchedTimes++;
        });
        // Act
        try {
          await store.dispatch(new Navigate(['/error'])).toPromise();
        } catch {
        } finally {
          // Assert
          const url = store.selectSnapshot(RouterState.url);
          expect(url).not.toBe('/error');
          expect(url).toBe(initialUrl);
          expect(routerNavigationDispatchedTimes).toBe(1);
          expect(navigationErrorEmittedTimes).toBe(1);
        }
      })
    );

    it(
      'should persist the previous state and NOT dispatch the `RouterNavigation` action if the timing is PostActivation',
      freshPlatform(async () => {
        // Arrange
        const { router, store, actions$ } = await createNgxsRouterPluginTestingPlatform(
          getTestModule({ navigationActionTiming: NavigationActionTiming.PostActivation })
        );
        const initialUrl = store.selectSnapshot(RouterState.url);

        let navigationErrorEmittedTimes = 0;
        let routerNavigationDispatchedTimes = 0;

        router.events
          .pipe(filter((event): event is NavigationError => event instanceof NavigationError))
          .subscribe(() => {
            navigationErrorEmittedTimes++;
          });

        actions$.pipe(ofActionDispatched(RouterNavigation)).subscribe(() => {
          routerNavigationDispatchedTimes++;
        });

        // Act
        try {
          await store.dispatch(new Navigate(['/error'])).toPromise();
        } catch {
        } finally {
          // Assert
          const url = store.selectSnapshot(RouterState.url);
          expect(url).not.toBe('/error');
          expect(url).toBe(initialUrl);
          expect(routerNavigationDispatchedTimes).toBe(0);
          expect(navigationErrorEmittedTimes).toBe(1);
        }
      })
    );
  });
});
