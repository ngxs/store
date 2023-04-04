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
import { NgxsModule, Selector, State, Store } from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';
import { first } from 'rxjs/operators';

import { RouterState, NgxsRouterPluginModule } from '../..';

describe('URL recognition in guards (https://github.com/ngxs/store/issues/1718)', () => {
  @Component({
    selector: 'app-root',
    template: '<router-outlet></router-outlet>'
  })
  class RootComponent {}

  @Component({
    selector: 'app-home',
    template: '<a class="navigate-to-details" routerLink="/details">Details</a>'
  })
  class HomeComponent {}

  @Component({
    selector: 'app-details',
    template: 'Details page'
  })
  class DetailsComponent {}

  interface AppStateModel {}

  @State({
    name: 'app',
    defaults: {}
  })
  @Injectable()
  class AppState {
    @Selector([RouterState.state])
    static getActiveRoute(
      _stateModel: AppStateModel,
      route: RouterStateSnapshot
    ): ActivatedRouteSnapshot {
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
      RouterModule.forRoot(routes, { initialNavigation: 'enabledBlocking' }),
      NgxsModule.forRoot(),
      NgxsRouterPluginModule.forRoot()
    ],
    declarations: [RootComponent, HomeComponent, DetailsComponent],
    bootstrap: [RootComponent],
    providers: [{ provide: APP_BASE_HREF, useValue: '/' }]
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
      document.body.querySelector<HTMLAnchorElement>('.navigate-to-details')!.click();
      await waitForNavigationToComplete(router).toPromise();

      // Assert
      expect(guard.detectedRouteUrl).toEqual('details');
    })
  );
});

function waitForNavigationToComplete(router: Router) {
  return router.events.pipe(first(event => event instanceof NavigationEnd));
}
