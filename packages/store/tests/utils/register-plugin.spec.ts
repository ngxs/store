import {
  Component,
  inject,
  Injectable,
  Injector,
  PendingTasks,
  provideAppInitializer
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';
import { Action, State, StateContext, Store, provideStore } from '@ngxs/store';

describe('lazyProvider', () => {
  class AddCountry {
    static readonly type = 'AddCountry';
    constructor(readonly country: string) {}
  }

  @State({
    name: 'countries',
    defaults: []
  })
  @Injectable()
  class CountriesState {
    @Action(AddCountry)
    addCountry(ctx: StateContext<string[]>, action: AddCountry) {
      ctx.setState(state => [...state, action.country]);
    }
  }

  it(
    'should navigate and provide feature store',
    freshPlatform(async () => {
      // Arrange
      @Component({
        selector: 'app-root',
        template: ''
      })
      class TestComponent {}

      let recorder!: any[];

      const appRef = await skipConsoleLogging(() =>
        bootstrapApplication(TestComponent, {
          providers: [
            provideStore([CountriesState], { developmentMode: false }),
            provideAppInitializer(() => {
              const injector = inject(Injector);
              const pendingTasks = inject(PendingTasks);
              pendingTasks.run(() =>
                import('./fixtures/register-plugin-fixture').then(m => {
                  m.registerPluginFixture(injector);
                  recorder = m.recorder;
                })
              );
            })
          ]
        })
      );
      await appRef.whenStable();

      const store = appRef.injector.get(Store);

      // Act
      const action = new AddCountry('USA');
      store.dispatch(action);
      appRef.destroy();

      // Assert
      expect(recorder).toEqual([
        { action, state: { countries: [] } },
        'LazyNgxsPlugin.destroy()'
      ]);
    })
  );
});
