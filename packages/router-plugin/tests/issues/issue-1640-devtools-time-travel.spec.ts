import { Component, NgModule, NgZone } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { NavigationEnd, Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';
import { first } from 'rxjs/operators';

import { NgxsRouterPluginModule } from '../..';

describe('Time-traveling with Redux DevTools (https://github.com/ngxs/store/issues/1640)', () => {
  @Component({
    selector: 'app-root',
    template: '<router-outlet></router-outlet>'
  })
  class RootComponent {}

  @Component({
    selector: 'app-home',
    template: 'Home page'
  })
  class HomeComponent {}

  @Component({
    selector: 'app-login',
    template: 'Login page'
  })
  class LoginComponent {}

  const routes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'login', component: LoginComponent }
  ];

  @NgModule({
    imports: [
      BrowserModule,
      RouterTestingModule.withRoutes(routes),
      NgxsModule.forRoot(),
      NgxsRouterPluginModule.forRoot()
    ],
    declarations: [RootComponent, HomeComponent, LoginComponent],
    bootstrap: [RootComponent]
  })
  class TestModule {}

  it(
    'should navigate back when the previous action is jumped through time-traveling',
    freshPlatform(async () => {
      // Arrange
      const { injector } = await skipConsoleLogging(() =>
        platformBrowserDynamic().bootstrapModule(TestModule)
      );
      const ngZone = injector.get(NgZone);
      const router = injector.get(Router);
      const store = injector.get(Store);
      jest.spyOn(router, 'navigateByUrl');
      // Act
      await ngZone.run(() => router.navigateByUrl('/home'));
      // Assert
      expect(router.url).toEqual('/home');
      // Save the state so we'll be able to reset it (this is what devtools plugin does).
      const previousState = store.snapshot();
      await ngZone.run(() => router.navigateByUrl('/login'));
      previousState.router.trigger = 'devtools';
      store.reset(previousState);
      await waitForNavigationToComplete(router).toPromise();
      // Assert
      expect(router.url).toEqual('/home');
    })
  );
});

function waitForNavigationToComplete(router: Router) {
  return router.events.pipe(first(event => event instanceof NavigationEnd));
}
