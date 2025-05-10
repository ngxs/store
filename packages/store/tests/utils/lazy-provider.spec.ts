import { Component, Injectable, NgZone } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';
import { State, Store, lazyProvider, provideStates, provideStore } from '@ngxs/store';
import { Router, RouterOutlet, provideRouter } from '@angular/router';

describe('lazyProvider', () => {
  @State({
    name: 'countries',
    defaults: []
  })
  @Injectable()
  class CountriesState {}

  const countriesStateProvider = provideStates([CountriesState]);

  it(
    'should navigate and provide feature store',
    freshPlatform(async () => {
      // Arrange
      @Component({
        selector: 'app-root',
        template: '<router-outlet></router-outlet>',
        imports: [RouterOutlet]
      })
      class TestComponent {}

      @Component({ selector: 'app-countries', template: '' })
      class CountriesComponent {}

      @Component({ selector: 'app-products', template: '' })
      class ProductsComponent {}

      const appRef = await skipConsoleLogging(() =>
        bootstrapApplication(TestComponent, {
          providers: [
            provideRouter([
              {
                path: 'countries',
                loadComponent: async () => CountriesComponent,
                canActivate: [lazyProvider(async () => countriesStateProvider)]
              },
              {
                path: 'products',
                loadComponent: async () => ProductsComponent,
                canActivate: [
                  lazyProvider(() => import('./fixtures/lazy-provider-default-export'))
                ]
              }
            ]),
            provideStore([], { developmentMode: false })
          ]
        })
      );
      const store = appRef.injector.get(Store);
      const ngZone = appRef.injector.get(NgZone);
      const router = appRef.injector.get(Router);

      // Assert
      expect(store.snapshot()).toEqual({});

      // Act
      await ngZone.run(() => router.navigateByUrl('/countries'));

      // Assert
      expect(store.snapshot()).toEqual({ countries: [] });

      // Act
      await ngZone.run(() => router.navigateByUrl('/products'));

      // Assert
      expect(store.snapshot()).toEqual({ countries: [], products: [] });

      appRef.destroy();
    })
  );
});
