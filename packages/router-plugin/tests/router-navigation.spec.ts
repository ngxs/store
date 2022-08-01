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
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { filter } from 'rxjs/operators';

import { NgxsModule, ofActionDispatched, Actions, Store } from '@ngxs/store';
import { NgxsRouterPluginModule, RouterNavigation, RouterState, Navigate } from '../';

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
    template: '<router-outlet></router-outlet>'
  })
  class RootComponent {}

  @Component({
    selector: 'home',
    template: ''
  })
  class HomeComponent {}

  @Component({
    selector: 'error',
    template: ''
  })
  class ErrorComponent {}

  @Component({
    selector: 'success',
    template: ''
  })
  class SuccessComponent {}

  function getTestModule() {
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
        ]),
        NgxsModule.forRoot([]),
        NgxsRouterPluginModule.forRoot()
      ],
      declarations: [RootComponent, HomeComponent, ErrorComponent, SuccessComponent],
      bootstrap: [RootComponent],
      providers: [
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
      'should persist previous state and NOT dispatch the `RouterNavigation` action',
      freshPlatform(async () => {
        // Arrange
        const { injector } = await skipConsoleLogging(() =>
          platformBrowserDynamic().bootstrapModule(getTestModule())
        );
        const actions$: Actions = injector.get(Actions);
        const store: Store = injector.get(Store);
        const router: Router = injector.get(Router);
        const initialUrl = store.selectSnapshot(RouterState.url);

        let navigationErrorEmittedTimes = 0;
        let routerNavigationDispatchedTimes = 0;

        const subscription = router.events
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
          subscription.unsubscribe();

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
