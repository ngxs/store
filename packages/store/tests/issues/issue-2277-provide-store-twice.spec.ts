import { ApplicationConfig, Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { DispatchOutsideZoneNgxsExecutionStrategy, provideStore } from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';

describe('provideStore() being called twice', () => {
  @Component({ selector: 'app-root', template: '' })
  class TestComponent {}

  @Component({ template: '' })
  class RouteComponent {}

  const appConfig: ApplicationConfig = {
    providers: [
      provideStore([], {
        executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy
      }),
      provideRouter([
        {
          path: 'route',
          loadComponent: () => RouteComponent,
          providers: [
            provideStore([], {
              executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy
            })
          ]
        }
      ])
    ]
  };

  it(
    'should throw an error when provideStore() is called twice',
    freshPlatform(async () => {
      // Arrange
      expect.hasAssertions();

      // Act
      const { injector } = await skipConsoleLogging(() =>
        bootstrapApplication(TestComponent, appConfig)
      );
      const router = injector.get(Router);

      try {
        await router.navigateByUrl('/route');
      } catch (error) {
        // Assert
        expect(error.message).toEqual('provideStore() should only be called once.');
      }
    })
  );
});
