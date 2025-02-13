import { Component, Injectable, inject, ɵChangeDetectionSchedulerImpl } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  Action,
  provideStore,
  Selector,
  State,
  StateContext,
  Store,
  withNgxsPendingTasks
} from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';

describe('Pending task notifications', () => {
  class Increment {
    static readonly type = 'Increment';
  }

  @State({
    name: 'counter',
    defaults: 0
  })
  @Injectable()
  class CounterState {
    @Selector()
    static getCounter(state: number) {
      return state;
    }

    @Action(Increment)
    increment(ctx: StateContext<number>) {
      ctx.setState(counter => counter + 1);
    }
  }

  @Component({
    selector: 'app-root',
    template: '<h1>{{ counter() }}</h1>'
  })
  class TestComponent {
    readonly counter = this.store.selectSignal(CounterState.getCounter);

    constructor(private store: Store) {
      for (let i = 0; i < 20; i++) {
        store.dispatch(new Increment());
      }
    }
  }

  const appConfig = {
    providers: [provideStore([CounterState], withNgxsPendingTasks())]
  };

  it(
    'should NOT call `scheduler.notify()` more than 20 times (because of 20 actions)',
    freshPlatform(async () => {
      // Arrange
      const notifySpy = jest.spyOn(ɵChangeDetectionSchedulerImpl.prototype, 'notify');
      // Act
      await skipConsoleLogging(() => bootstrapApplication(TestComponent, appConfig));
      try {
        // Assert
        expect(notifySpy).toHaveBeenCalledTimes(2);
        expect(document.body.innerHTML).toContain('<h1>20</h1>');
      } finally {
        notifySpy.mockRestore();
      }
    })
  );
});
