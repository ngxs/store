import { Component, Injectable, NgZone } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';
import {
  Action,
  NoopNgxsExecutionStrategy,
  State,
  StateContext,
  Store,
  provideStates,
  provideStore
} from '@ngxs/store';
import { Router, provideRouter } from '@angular/router';

import { NGXS_EXECUTION_STRATEGY } from '../../src/execution/symbols';
import { DispatchOutsideZoneNgxsExecutionStrategy } from '../../src/execution/dispatch-outside-zone-ngxs-execution-strategy';

describe('Standalone features', () => {
  class AddCountry {
    static readonly type = 'Add country';
    constructor(readonly country: string) {}
  }

  @State({
    name: 'countries',
    defaults: []
  })
  @Injectable()
  class CountriesState {
    @Action(AddCountry)
    addCountry(ctx: StateContext<string[]>, action: AddCountry): void {
      ctx.setState(state => [...state, action.country]);
    }
  }

  it(
    'should bootstrap with no explicit options',
    freshPlatform(async () => {
      // Arrange
      @Component({
        selector: 'app-root',
        template: '',
        standalone: true
      })
      class TestComponent {}

      // Act
      const appRef = await skipConsoleLogging(() =>
        bootstrapApplication(TestComponent, {
          providers: [provideStore([])]
        })
      );

      // Assert
      expect(appRef.injector.get(NGXS_EXECUTION_STRATEGY)).toBeInstanceOf(
        DispatchOutsideZoneNgxsExecutionStrategy
      );

      appRef.destroy();
    })
  );

  it(
    'should overwrite default values when `withNgxsConfig` is provided',
    freshPlatform(async () => {
      // Arrange
      @Component({
        selector: 'app-root',
        template: '',
        standalone: true
      })
      class TestComponent {}

      // Act
      const appRef = await skipConsoleLogging(() =>
        bootstrapApplication(TestComponent, {
          providers: [
            provideStore([], {
              executionStrategy: NoopNgxsExecutionStrategy
            })
          ]
        })
      );

      // Assert
      expect(appRef.injector.get(NGXS_EXECUTION_STRATEGY)).toBeInstanceOf(
        NoopNgxsExecutionStrategy
      );

      appRef.destroy();
    })
  );

  it(
    'should bootstrap an app with `provideStore`',
    freshPlatform(async () => {
      // Arrange
      @Component({
        selector: 'app-root',
        template: '',
        standalone: true
      })
      class TestComponent {}

      const appRef = await skipConsoleLogging(() =>
        bootstrapApplication(TestComponent, {
          providers: [provideStore([CountriesState], { developmentMode: false })]
        })
      );
      const store = appRef.injector.get(Store);

      // Assert
      expect(store.snapshot()).toEqual({ countries: [] });

      // Act
      store.dispatch(new AddCountry('Canada'));

      // Assert
      expect(store.snapshot()).toEqual({ countries: ['Canada'] });

      appRef.destroy();
    })
  );

  it(
    'should navigate and provide feature store',
    freshPlatform(async () => {
      // Arrange
      @Component({
        selector: 'app-root',
        template: '<router-outlet></router-outlet>',
        standalone: true
      })
      class TestComponent {}

      @Component({
        template: '',
        standalone: true
      })
      class ProductsComponent {}

      @State({
        name: 'products',
        defaults: []
      })
      @Injectable()
      class ProductsState {}

      const appRef = await skipConsoleLogging(() =>
        bootstrapApplication(TestComponent, {
          providers: [
            provideRouter([
              {
                path: 'products',
                loadComponent: async () => ProductsComponent,
                providers: [provideStates([ProductsState])]
              }
            ]),
            provideStore([CountriesState], { developmentMode: false })
          ]
        })
      );
      const store = appRef.injector.get(Store);
      const ngZone = appRef.injector.get(NgZone);
      const router = appRef.injector.get(Router);

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
