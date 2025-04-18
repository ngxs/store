import { RouterTestingModule } from '@angular/router/testing';
import { APP_BASE_HREF, DOCUMENT } from '@angular/common';
import { Component, NgModule, Injectable } from '@angular/core';
import { Routes, CanActivate } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { DispatchOutsideZoneNgxsExecutionStrategy, Store, provideStore } from '@ngxs/store';
import { freshPlatform } from '@ngxs/store/internals/testing';

import { Navigate, withNgxsRouterPlugin } from '../..';

import { createNgxsRouterPluginTestingPlatform } from '../helpers';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  standalone: false
})
class RootComponent {}

@Component({
  selector: 'app-home',
  template: 'Home page',
  standalone: false
})
class HomeComponent {}

@Component({
  selector: 'app-login',
  template: 'Login page',
  standalone: false
})
class LoginComponent {}

@Component({
  selector: 'app-blog',
  template: 'Blog page',
  standalone: false
})
class BlogComponent {}

@Injectable()
class AuthGuard implements CanActivate {
  constructor(private store: Store) {}

  canActivate(): boolean {
    const isAuthenticated = false;

    if (isAuthenticated) {
      return true;
    }

    this.store.dispatch(new Navigate(['/login']));
    return false;
  }
}

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'blog',
        component: BlogComponent
      }
    ]
  },
  {
    path: '**',
    component: LoginComponent
  }
];

function getTestModule() {
  @NgModule({
    imports: [BrowserModule, RouterTestingModule.withRoutes(routes)],
    declarations: [RootComponent, HomeComponent, BlogComponent, LoginComponent],
    bootstrap: [RootComponent],
    providers: [
      provideStore(
        [],
        {
          executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy
        },
        withNgxsRouterPlugin()
      ),
      AuthGuard,
      { provide: APP_BASE_HREF, useValue: '/' }
    ]
  })
  class TestModule {}

  return TestModule;
}

// See https://github.com/ngxs/store/issues/1293
describe('#1293 issue', () => {
  it(
    'should not infinitely redirect because of reverted snapshot',
    freshPlatform(async () => {
      // Assert
      const { router, injector, ngZone } =
        await createNgxsRouterPluginTestingPlatform(getTestModule());

      // Act
      await ngZone.run(() => router.navigateByUrl('/'));

      const url = router.url;
      const document = injector.get(DOCUMENT);
      const root = document.querySelector('app-root')!;

      // Assert
      expect(url).toBe('/login');
      expect(root.innerHTML).toContain('<app-login>Login page</app-login>');
    })
  );
});
