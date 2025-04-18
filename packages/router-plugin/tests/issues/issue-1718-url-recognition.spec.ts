import { APP_BASE_HREF } from '@angular/common';
import { Component, Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  NavigationEnd,
  Router,
  RouterModule,
  RouterStateSnapshot,
  Routes
} from '@angular/router';
import {
  DispatchOutsideZoneNgxsExecutionStrategy,
  Selector,
  State,
  Store,
  provideStore
} from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';
import { first } from 'rxjs/operators';

import { RouterState, withNgxsRouterPlugin } from '../..';

describe('URL recognition in guards (https://github.com/ngxs/store/issues/1718)', () => {
  @Component({
    selector: 'app-root',
    template: '<router-outlet></router-outlet>',
    standalone: false
  })
  class RootComponent {}

  @Component({
    selector: 'app-home',
    template: '<a class="navigate-to-details" routerLink="/details">Details</a>',
    standalone: false
  })
  class HomeComponent {}

  @Component({
    selector: 'app-details',
    template: 'Details page',
    standalone: false
  })
  class DetailsComponent {}

  @State({
    name: 'app',
    defaults: {}
  })
  @Injectable()
  class AppState {
    @Selector([RouterState.state()])
    static getActiveRoute(route: RouterStateSnapshot): ActivatedRouteSnapshot {
      let state: ActivatedRouteSnapshot = route.root;
      while (state.firstChild) {
        state = state.firstChild;
      }
      return state;
    }
  }

  @Injectable({ providedIn: 'root' })
  class DetailsRouteParamsGuard implements CanActivate {
    detectedRouteUrl: string;

    constructor(private _store: Store) {}

    canActivate(): boolean {
      const route = this._store.selectSnapshot(AppState.getActiveRoute);
      this.detectedRouteUrl = route.url[0].path;
      return true;
    }
  }

  const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'details', component: DetailsComponent, canActivate: [DetailsRouteParamsGuard] },
    { path: '**', redirectTo: 'home' }
  ];

  @NgModule({
    imports: [
      BrowserModule,
      RouterModule.forRoot(routes, { initialNavigation: 'enabledBlocking' })
    ],
    declarations: [RootComponent, HomeComponent, DetailsComponent],
    bootstrap: [RootComponent],
    providers: [
      provideStore(
        [],
        {
          executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy
        },
        withNgxsRouterPlugin()
      ),
      { provide: APP_BASE_HREF, useValue: '/' }
    ]
  })
  class TestModule {}

  it(
    'should be able to resolve the recognized URL in the guard',
    freshPlatform(async () => {
      // Arrange
      const { injector } = await skipConsoleLogging(() =>
        platformBrowserDynamic().bootstrapModule(TestModule)
      );
      const router = injector.get(Router);
      const guard = injector.get(DetailsRouteParamsGuard);

      // Assert
      expect(document.body.innerHTML).toContain('app-home');

      // Act
      const waitForNavigationToCompletePromise =
        waitForNavigationToComplete(router).toPromise();
      document.body.querySelector<HTMLAnchorElement>('.navigate-to-details')!.click();
      await waitForNavigationToCompletePromise;

      // Assert
      expect(guard.detectedRouteUrl).toEqual('details');
    })
  );
});

function waitForNavigationToComplete(router: Router) {
  return router.events.pipe(first(event => event instanceof NavigationEnd));
}
