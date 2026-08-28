import { JsonPipe } from '@angular/common';
import { Component, Injectable, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import {
  Action,
  State,
  StateContext,
  StateToken,
  dispatch,
  provideStore,
  select,
  withNgxsPendingTasks
} from '@ngxs/store';
import {
  ConsoleRecorder,
  freshPlatform,
  skipConsoleLogging
} from '@ngxs/store/internals/testing';

describe('withNgxsPendingTasks timeout', () => {
  const COUNTRIES_STATE_TOKEN = new StateToken<string[]>('countries');

  class AddCountry {
    static type = '[Countries] Add country';
  }

  class AddCountrySlowly {
    static type = '[Countries] Add country slowly';
  }

  @State({
    name: COUNTRIES_STATE_TOKEN,
    defaults: ['Angola']
  })
  @Injectable()
  class CountriesState {
    @Action(AddCountry)
    addCountry() {
      // Never resolves — mimics a handler whose completion context never
      // reaches the pending-tasks stream.
      return new Promise<void>(() => {});
    }

    @Action(AddCountrySlowly)
    async addCountrySlowly(ctx: StateContext<string[]>) {
      await new Promise(resolve => setTimeout(resolve, 0));
      ctx.setState(state => [...state, 'Namibia']);
    }
  }

  @Component({
    selector: 'app-root',
    template: `<div>{{ countries() | json }}</div>`,
    standalone: true,
    imports: [JsonPipe]
  })
  class HangingComponent {
    countries = select(COUNTRIES_STATE_TOKEN);
    private addCountry = dispatch(AddCountry);
    constructor() {
      this.addCountry(new AddCountry());
    }
  }

  @Component({
    selector: 'app-root',
    template: `<div>{{ countries() | json }}</div>`,
    standalone: true,
    imports: [JsonPipe]
  })
  class SlowComponent {
    countries = select(COUNTRIES_STATE_TOKEN);
    private addCountrySlowly = dispatch(AddCountrySlowly);
    constructor() {
      this.addCountrySlowly(new AddCountrySlowly());
    }
  }

  function render(component: any, timeout?: number) {
    return renderApplication(
      context =>
        bootstrapApplication(
          component,
          {
            providers: [
              provideZonelessChangeDetection(),
              provideStore([CountriesState], withNgxsPendingTasks({ timeout }))
            ]
          },
          context
        ),
      { document: '<app-root></app-root>', url: '/' }
    );
  }

  it(
    'should stop blocking SSR once the timeout elapses for a hanging action',
    freshPlatform(async () => {
      // Arrange
      const consoleRecorder: ConsoleRecorder = [];
      // Act
      // Without the timeout this render never resolves and the test times out.
      const html = await skipConsoleLogging(
        () => render(HangingComponent, 10),
        consoleRecorder
      );
      // Assert
      expect(html).toContain('Angola');
      expect(
        consoleRecorder.some(
          ([level, args]) =>
            level === 'warn' && String(args[0]).includes('withNgxsPendingTasks timed out')
        )
      ).toBe(true);
    })
  );

  it(
    'should still wait for actions that complete before the timeout',
    freshPlatform(async () => {
      // Arrange
      const consoleRecorder: ConsoleRecorder = [];
      // Act
      const html = await skipConsoleLogging(
        () => render(SlowComponent, 5000),
        consoleRecorder
      );
      // Assert
      expect(html).toContain('Namibia');
      expect(
        consoleRecorder.some(
          ([level, args]) =>
            level === 'warn' && String(args[0]).includes('withNgxsPendingTasks timed out')
        )
      ).toBe(false);
    })
  );
});
