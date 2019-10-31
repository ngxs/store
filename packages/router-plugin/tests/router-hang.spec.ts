import { RouterTestingModule } from '@angular/router/testing';
import { APP_BASE_HREF, DOCUMENT } from '@angular/common';
import { Component, NgModule, Injectable } from '@angular/core';
import { Routes, CanActivate } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsModule, Store } from '@ngxs/store';
import { freshPlatform } from '@ngxs/store/internals/testing';

import { NgxsRouterPluginModule, Navigate } from '../';

import { createNgxsRouterPluginTestingPlatform } from './helpers';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>'
})
class RootComponent {}

@Component({
  selector: 'app-home',
  template: '<h1>This is home page</h1>'
})
class HomeComponent {}

@Component({
  selector: 'app-login',
  template: '<h1>This is login page</h1>'
})
class LoginComponent {}

@Component({
  selector: 'app-blog',
  template: '<h1>This is blog page</h1>'
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
    imports: [
      BrowserModule,
      RouterTestingModule.withRoutes(routes),
      NgxsModule.forRoot(),
      NgxsRouterPluginModule.forRoot()
    ],
    declarations: [RootComponent, HomeComponent, BlogComponent, LoginComponent],
    bootstrap: [RootComponent],
    providers: [AuthGuard, { provide: APP_BASE_HREF, useValue: '/' }]
  })
  class TestModule {}

  return TestModule;
}

// See https://github.com/ngxs/store/issues/1293
// and https://github.com/ngxs/store/issues/1407
describe('@ngxs/router-plugin #(1293,1407) issues', () => {
  it(
    'should not infinitely redirect because of reverted snapshot',
    freshPlatform(async () => {
      // Assert
      const { router, injector } = await createNgxsRouterPluginTestingPlatform(
        getTestModule()
      );

      // Act
      await router.navigateByUrl('/');

      const url = router.url;
      const document = injector.get(DOCUMENT);
      const h1 = document.querySelector('h1')!;

      // Assert
      expect(url).toBe('/login');
      expect(h1.innerHTML).toBe('This is login page');
    })
  );
});
