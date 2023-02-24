import { Component, NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Action, NgxsModule, State, StateContext, Store } from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';

describe('Selectors within templates causing ticks (https://github.com/ngxs/store/issues/933)', () => {
  class SetCountries {
    static readonly type = '[CountriesState] Set countries';

    constructor(public countries: string[]) {}
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
    selector: 'app-child',
    template: `
      {{ countries$ | async }}
    `
  })
  class TestChildComponent {
    countries$ = this.store.select(CountriesState);

    constructor(private store: Store) {}
  }

  @Component({
    selector: 'app-root',
    template: `
      <app-child *ngFor="let item of items"></app-child>
    `
  })
  class TestComponent {
    items = new Array(10);
  }

  @NgModule({
    imports: [BrowserModule, NgxsModule.forRoot([CountriesState])],
    declarations: [TestComponent, TestChildComponent],
    bootstrap: [TestComponent]
  })
  class TestModule {}

  it(
    'should run change detection once for all selectors when asynchronous action has been completed',
    freshPlatform(async () => {
      // Arrange
      const { injector } = await skipConsoleLogging(() =>
        platformBrowserDynamic().bootstrapModule(TestModule)
      );
      const store = injector.get(Store);
      const appRef = injector.get(ApplicationRef);
      const spy = jest.spyOn(appRef, 'tick');
      const children = document.querySelectorAll('app-child');

      // Act
      await store.dispatch(new SetCountries(['USA', 'Canada'])).toPromise();

      // Assert
      try {
        children.forEach(child => {
          expect(child.innerHTML).toContain('USA,Canada');
        });

        expect(spy).toHaveBeenCalledTimes(3);
      } finally {
        spy.mockRestore();
      }
    })
  );

  it(
    '`store.select` should emit state changes and should emit the latest value even if there are no subscription (since the `refCount()` is used)',
    freshPlatform(async () => {
      // Arrange
      const { injector } = await skipConsoleLogging(() =>
        platformBrowserDynamic().bootstrapModule(TestModule)
      );
      const store = injector.get(Store);
      const recordedCountries: string[][] = [];

      // Act
      let subscription = store.select(CountriesState).subscribe(countries => {
        recordedCountries.push(countries);
      });

      await store.dispatch(new SetCountries(['USA'])).toPromise();

      // Assert
      expect(recordedCountries).toEqual([[], ['USA']]);

      // Act
      subscription.unsubscribe();
      recordedCountries.length = 0;

      await store.dispatch(new SetCountries(['Canada'])).toPromise();
      await store.dispatch(new SetCountries(['Mexico'])).toPromise();

      subscription = store.select(CountriesState).subscribe(countries => {
        recordedCountries.push(countries);
      });

      // Assert
      expect(recordedCountries).toEqual([['Mexico']]);
      expect(store.selectSnapshot(CountriesState)).toEqual(['Mexico']);

      // Act
      await store.dispatch(new SetCountries(['Salvador'])).toPromise();

      // Assert
      expect(recordedCountries).toEqual([['Mexico'], ['Salvador']]);
      expect(store.selectSnapshot(CountriesState)).toEqual(['Salvador']);

      subscription.unsubscribe();
    })
  );
});
