import { Component, NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Action, NgxsModule, State, StateContext, Store } from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';

describe('Selectors within templates causing ticks (https://github.com/ngxs/store/issues/933)', () => {
  class SetCountries {
    static readonly type = '[CountriesState] Set countries';
  }

  @State<string[]>({
    name: 'countries',
    defaults: []
  })
  class CountriesState {
    @Action(SetCountries)
    async setCountries(ctx: StateContext<string[]>) {
      await Promise.resolve();
      ctx.setState(['USA', 'Canada']);
    }
  }

  const count = 10;

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
    items = new Array(count);
  }

  @NgModule({
    imports: [BrowserModule, NgxsModule.forRoot([CountriesState])],
    declarations: [TestComponent, TestChildComponent],
    bootstrap: [TestComponent]
  })
  class TestModule {}

  it(
    'should run change detection whenever the selector emits after asynchronous action has been completed',
    freshPlatform(async () => {
      // Arrange
      const { injector } = await skipConsoleLogging(() =>
        platformBrowserDynamic().bootstrapModule(TestModule)
      );
      const store = injector.get(Store);
      const appRef = injector.get(ApplicationRef);
      const spy = jest.spyOn(appRef, 'tick');

      // Act
      await store.dispatch(new SetCountries()).toPromise();

      // Assert
      try {
        expect(spy.mock.calls.length).toBeGreaterThan(count);
      } finally {
        spy.mockRestore();
      }
    })
  );
});
