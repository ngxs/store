import { Component, Injectable, inject, ɵChangeDetectionSchedulerImpl } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  Action,
  provideStore,
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
    @Action(Increment)
    increment(ctx: StateContext<number>) {
      ctx.setState(counter => counter + 1);
    }
  }

  @Component({
    selector: 'app-root',
    template: ''
  })
  class TestComponent {
    constructor() {
      const store = inject(Store);
      for (let i = 0; i < 20; i++) {
        store.dispatch(new Increment());
      }
    }
  }

  const appConfig = {
    providers: [provideStore([CounterState], withNgxsPendingTasks())]
  };

  it(
    'should call `scheduler.notify()` more than 20 times',
    freshPlatform(async () => {
      // Arrange
      const notifySpy = jest.spyOn(ɵChangeDetectionSchedulerImpl.prototype, 'notify');
      // Act
      await skipConsoleLogging(() => bootstrapApplication(TestComponent, appConfig));
      try {
        // Assert
        // `notify` has been called more than 20 times because we dispatched 20 times.
        expect(notifySpy.mock.calls.length > 20).toBeTruthy();
      } finally {
        notifySpy.mockRestore();
      }
    })
  );
});
