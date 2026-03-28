import { ApplicationRef, Component, ErrorHandler, inject, Injectable } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  Action,
  provideStore,
  State,
  StateContext,
  StateContextDestroyedError,
  Store
} from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';
import { finalize, firstValueFrom, timer } from 'rxjs';

describe('Injector destroyed inside action handler', () => {
  class SetCountries {
    static readonly type = '[CountriesState] Set countries';

    constructor(readonly countries: string[]) {}
  }

  @State<string[]>({
    name: 'countries',
    defaults: []
  })
  @Injectable()
  class CountriesState {
    private _appRef = inject(ApplicationRef);

    @Action(SetCountries)
    setCountries(ctx: StateContext<string[]>, action: SetCountries) {
      // Destroy the app on the next tick, while the action observable is still in-flight.
      setTimeout(() => this._appRef.destroy());
      return timer(200).pipe(
        finalize(() => {
          // finalize runs after the timer completes (or errors/unsubscribes).
          // By this point the injector has already been destroyed, so ctx.setState
          // must be a no-op rather than throwing an ObjectUnsubscribedError.
          ctx.setState(action.countries);
        })
      );
    }
  }

  @Component({ selector: 'app-root', template: '' })
  class AppComponent {}

  const recorder: StateContextDestroyedError[] = [];
  class TestErrorHandler implements ErrorHandler {
    handleError(error: any): void {
      recorder.push(error);
    }
  }

  it(
    'should not throw an UnsubscriptionError when injector is destroyed in the middle of actions execution',
    freshPlatform(async () => {
      // Arrange
      const { injector } = await skipConsoleLogging(() =>
        bootstrapApplication(AppComponent, {
          providers: [
            {
              provide: ErrorHandler,
              useFactory: () => new TestErrorHandler()
            },
            provideStore([CountriesState])
          ]
        })
      );

      const store = injector.get(Store);

      // Act — dispatch completes (or the firstValueFrom default kicks in) after
      // the injector is destroyed mid-flight.
      await firstValueFrom(store.dispatch(new SetCountries(['Canada'])), {
        defaultValue: undefined
      });

      // Assert — setState was silently skipped, so state stays at its default.
      expect(store.snapshot()).toEqual({ countries: [] });
      expect(recorder.length).toEqual(1);
      expect(recorder[0].path).toEqual('countries');
    })
  );
});
