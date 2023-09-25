import { APP_BASE_HREF } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Router, RouterEvent, RouterModule } from '@angular/router';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { Subject } from 'rxjs';
import { provideStore } from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';

import { RouterState, withNgxsRouterPlugin } from '../';

describe('RouterState cleanup', () => {
  @Component({
    selector: 'app-root',
    template: ''
  })
  class TestComponent {}

  @NgModule({
    imports: [BrowserModule, RouterModule.forRoot([], { initialNavigation: 'disabled' })],
    declarations: [TestComponent],
    providers: [
      provideStore([], withNgxsRouterPlugin()),
      { provide: APP_BASE_HREF, useValue: '/' }
    ],
    bootstrap: [TestComponent]
  })
  class TestModule {}

  it(
    'should cleanup subscriptions when the root view is destroyed',
    freshPlatform(async () => {
      // Arrange & act
      const ngModuleRef = await skipConsoleLogging(() =>
        platformBrowserDynamic().bootstrapModule(TestModule)
      );

      const router = ngModuleRef.injector.get(Router);
      const events = router.events as Subject<RouterEvent>;
      const routerState = ngModuleRef.injector.get(RouterState);
      const spy = jest.spyOn(routerState, 'ngOnDestroy');

      try {
        // Assert
        expect(events.observers.length).toBeGreaterThan(0);
        ngModuleRef.destroy();
        expect(spy).toHaveBeenCalled();
        expect(events.observers.length).toEqual(0);
      } finally {
        spy.mockRestore();
      }
    })
  );
});
