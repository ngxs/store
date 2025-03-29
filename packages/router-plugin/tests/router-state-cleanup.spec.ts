import { APP_BASE_HREF } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Router, RouterEvent, RouterModule } from '@angular/router';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Subject } from 'rxjs';
import { DispatchOutsideZoneNgxsExecutionStrategy, provideStore } from '@ngxs/store';
import { withNgxsRouterPlugin } from '@ngxs/router-plugin';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';

describe('RouterState cleanup', () => {
  @Component({
    selector: 'app-root',
    template: '',
    standalone: false
  })
  class TestComponent {}

  @NgModule({
    imports: [BrowserModule, RouterModule.forRoot([], { initialNavigation: 'disabled' })],
    declarations: [TestComponent],
    providers: [
      provideStore(
        [],
        {
          executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy
        },
        withNgxsRouterPlugin()
      ),
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
      const events = router.events as unknown as Subject<RouterEvent>;

      // Assert
      expect(events.observers.length).toBeGreaterThan(0);
      ngModuleRef.destroy();
      expect(events.observers.length).toEqual(0);
    })
  );
});
