import { APP_BASE_HREF } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { Component, NgModule, NgZone, Injectable } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';
import { State, NgxsModule, Store, StateToken } from '@ngxs/store';

import { NgxsStoragePluginModule } from '../../';

describe('Restore state only if key matches', () => {
  beforeEach(() => {
    // Caretaker note: it somehow sets `/@angular-cli-builders` as a default URL, thus when running `initialNavigation()`
    // it errors that there's no route definition for the `/@angular-cli-builders`.
    spyOn(Router.prototype, 'initialNavigation').and.returnValue(undefined);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it(
    'should not deserialize the state twice if the state should not be handled by the storage plugin',
    freshPlatform(async () => {
      // Arrange
      interface AuthStateModel {
        token: string;
      }

      const AUTH_STATE_TOKEN = new StateToken<AuthStateModel | null>('auth');

      localStorage.setItem(
        AUTH_STATE_TOKEN.getName(),
        JSON.stringify({
          token: 'initialTokenFromLocalStorage'
        })
      );

      @State<AuthStateModel | null>({
        name: AUTH_STATE_TOKEN,
        defaults: null
      })
      @Injectable()
      class AuthState {}

      @State({
        name: 'user',
        defaults: {}
      })
      @Injectable()
      class UserState {}

      @Component({ template: '' })
      class UserComponent {}

      @NgModule({
        imports: [
          RouterModule.forChild([
            {
              path: '',
              component: UserComponent
            }
          ]),
          NgxsModule.forFeature([UserState])
        ],
        declarations: [UserComponent]
      })
      class UserModule {}

      @Component({ selector: 'app-root', template: '<router-outlet></router-outlet>' })
      class TestComponent {}

      @NgModule({
        imports: [
          BrowserModule,
          RouterModule.forRoot([
            {
              path: 'user',
              loadChildren: () => UserModule
            }
          ]),
          NgxsModule.forRoot([AuthState]),
          NgxsStoragePluginModule.forRoot({
            key: [AuthState]
          })
        ],
        declarations: [TestComponent],
        bootstrap: [TestComponent],
        providers: [{ provide: APP_BASE_HREF, useValue: '/' }]
      })
      class TestModule {}

      // Act
      const { injector } = await skipConsoleLogging(() =>
        platformBrowserDynamic().bootstrapModule(TestModule)
      );
      const ngZone = injector.get(NgZone);
      const router = injector.get(Router);
      const store = injector.get(Store);
      const subscribeSpy = jest.fn();
      const subscription = store.select(AuthState).subscribe(subscribeSpy);

      // Well, we're explicitly setting another value for the auth state before going to the `/user` route.
      // Previously, it would've retrieved the auth state value from the local storage each time the `UpdateState`
      // action is dispatched. See `storage.plugin.ts` and `!event.addedStates.hasOwnProperty(key)` expression which
      // runs `continue` if the state, which has been added, shouldn't be handled by the storage plugin.
      localStorage.setItem(
        AUTH_STATE_TOKEN.getName(),
        JSON.stringify({ token: 'manuallySetTokenToEnsureItIsNotRetrievedAgain' })
      );

      await ngZone.run(() => router.navigateByUrl('/user'));

      // Assert
      expect(subscribeSpy).toHaveBeenCalledTimes(1);
      expect(subscribeSpy).toHaveBeenCalledWith({
        token: 'initialTokenFromLocalStorage'
      });

      subscription.unsubscribe();
    })
  );
});
