import {
  APP_BOOTSTRAP_LISTENER,
  APP_INITIALIZER,
  Component,
  inject,
  Injectable
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { Action, provideStore, State, StateContext, Store } from '@ngxs/store';
import { withNgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';

import { LoggerSpy, formatActionCallStack } from '../helpers';

describe('Running `filter: () => ...` function within the injection context', () => {
  class Increment {
    static readonly type = 'Increment';
  }

  interface CounterStateModel {
    counter: number;
  }

  @State({ name: 'test', defaults: { counter: 0 } })
  @Injectable()
  class CounterState {
    @Action(Increment)
    increment(ctx: StateContext<CounterStateModel>) {
      ctx.setState(state => ({ counter: state.counter + 1 }));
    }
  }

  @Injectable({ providedIn: 'root' })
  class BootstrapState {
    bootstrapped = false;
  }

  const logger = new LoggerSpy();

  const appConfig = {
    providers: [
      {
        provide: APP_INITIALIZER,
        useFactory: () => {
          const store = inject(Store);
          return () => store.dispatch(new Increment());
        },
        multi: true
      },

      {
        provide: APP_BOOTSTRAP_LISTENER,
        useFactory: () => {
          const bootstrapState = inject(BootstrapState);
          return () => {
            bootstrapState.bootstrapped = true;
          };
        },
        multi: true
      },

      provideStore(
        [CounterState],
        withNgxsLoggerPlugin({
          logger,
          filter: () => {
            const bootstrapState = inject(BootstrapState);
            return bootstrapState.bootstrapped;
          }
        })
      )
    ]
  };

  @Component({ selector: 'app-root', template: '', standalone: true })
  class TestComponent {}

  it(
    'should not log actions until the bootstrap is done',
    freshPlatform(async () => {
      // Arrange
      const { injector } = await skipConsoleLogging(() =>
        bootstrapApplication(TestComponent, appConfig)
      );
      const store = injector.get(Store);

      // Assert
      expect(logger.callStack).toEqual(LoggerSpy.createCallStack([]));

      // Act
      store.dispatch(new Increment());

      // Assert
      expect(logger.callStack).toEqual(
        LoggerSpy.createCallStack([
          ...formatActionCallStack({
            action: Increment.type,
            prevState: { counter: 1 },
            nextState: { counter: 2 }
          })
        ])
      );
    })
  );
});
