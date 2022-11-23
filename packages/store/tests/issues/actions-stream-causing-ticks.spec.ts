import { Component, NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { take } from 'rxjs/operators';
import {
  Action,
  Actions,
  NgxsModule,
  ofActionSuccessful,
  State,
  StateContext,
  Store
} from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';

describe('Actions stream causing ticks', () => {
  class SetCountries {
    static readonly type = '[CountriesState] Set countries';

    constructor(readonly countries: string[]) {}
  }

  @State<string[]>({
    name: 'countries',
    defaults: []
  })
  class CountriesState {
    @Action(SetCountries)
    async setCountries(ctx: StateContext<string[]>, action: SetCountries) {
      await Promise.resolve();
      ctx.setState(action.countries);
    }
  }

  @Component({
    selector: 'app-root',
    template: '<button id="set-countries" (click)="setCountries()">Set countries</button>'
  })
  class TestComponent {
    constructor(private _store: Store, actions$: Actions) {
      // Create 10 subscriptions in a row.
      Array.from({ length: 10 }).forEach(() => {
        actions$.pipe(ofActionSuccessful(SetCountries)).subscribe();
      });
    }

    setCountries(): void {
      this._store.dispatch(new SetCountries(['USA']));
    }
  }

  @NgModule({
    imports: [BrowserModule, NgxsModule.forRoot([CountriesState])],
    declarations: [TestComponent],
    bootstrap: [TestComponent]
  })
  class TestModule {}

  it(
    'should NOT run change detection whenever `Actions` stream emits',
    freshPlatform(async () => {
      // Arrange
      const { injector } = await skipConsoleLogging(() =>
        platformBrowserDynamic().bootstrapModule(TestModule)
      );
      const actions$ = injector.get(Actions);
      const appRef = injector.get(ApplicationRef);
      jest.spyOn(appRef, 'tick');

      // Act
      document.getElementById('set-countries')!.click();
      await actions$.pipe(ofActionSuccessful(SetCountries), take(1)).toPromise();

      // Assert
      expect(appRef.tick).toHaveBeenCalledTimes(2);
    })
  );
});
