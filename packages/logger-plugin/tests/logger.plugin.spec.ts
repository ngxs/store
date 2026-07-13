import { Injectable } from '@angular/core';
import {
  Action,
  getActionTypeFromInstance,
  InitState,
  State,
  StateContext
} from '@ngxs/store';
import { of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

import { setupWithLogger, formatActionCallStack, LoggerSpy } from './helpers';

describe('NgxsLoggerPlugin', () => {
  const thrownErrorMessage = 'Error';
  const defaultBarValue = 'baz';

  class UpdateBarAction {
    static type = 'UPDATE_BAR';

    constructor(public bar?: string) {}
  }

  class ErrorAction {
    static type = 'ERROR';
  }

  class AsyncAction {
    static type = 'ASYNC_ACTION';
    constructor(public bar?: string) {}
  }

  class AsyncError {
    static type = 'ASYNC_ERROR';
    constructor(public message: string) {}
  }

  interface StateModel {
    bar: string;
  }

  const stateModelDefaults: StateModel = {
    bar: ''
  };

  @State<StateModel>({
    name: 'test',
    defaults: stateModelDefaults
  })
  @Injectable()
  class TestState {
    @Action(UpdateBarAction)
    updateBar({ patchState }: StateContext<StateModel>, { bar }: UpdateBarAction) {
      patchState({ bar: bar || defaultBarValue });
    }

    @Action(ErrorAction)
    error() {
      return throwError(new Error(thrownErrorMessage));
    }

    @Action(AsyncAction)
    asyncAction({ patchState }: StateContext<StateModel>, { bar }: AsyncAction) {
      patchState({ bar: '...' });
      return of(null).pipe(
        delay(1),
        tap(() => patchState({ bar: bar || defaultBarValue }))
      );
    }

    @Action(AsyncError)
    asyncErrorAction({ patchState }: StateContext<StateModel>, { message }: AsyncError) {
      patchState({ bar: '...' });
      return of(null).pipe(
        delay(1),
        tap(() => {
          patchState({ bar: 'erroring' });
          throw new Error(message);
        })
      );
    }
  }

  it('should log success action', () => {
    const { store, logger } = setupWithLogger([TestState]);

    store.dispatch(new UpdateBarAction());

    const expectedCallStack = LoggerSpy.createCallStack([
      ...formatActionCallStack({ action: InitState.type, prevState: stateModelDefaults }),

      ...formatActionCallStack({
        action: UpdateBarAction.type,
        prevState: stateModelDefaults,
        nextState: { bar: defaultBarValue }
      })
    ]);

    expect(logger.callStack).toEqual(expectedCallStack);
  });

  it('should log success action with payload', () => {
    const { store, logger } = setupWithLogger([TestState]);
    const payload = 'qux';

    store.dispatch(new UpdateBarAction(payload));

    const expectedCallStack = LoggerSpy.createCallStack([
      ...formatActionCallStack({ action: InitState.type, prevState: stateModelDefaults }),

      ...formatActionCallStack({
        action: UpdateBarAction.type,
        prevState: stateModelDefaults,
        nextState: { bar: payload },
        payload: { bar: payload }
      })
    ]);

    expect(logger.callStack).toEqual(expectedCallStack);
  });

  it('should log error action', () => {
    const { store, logger } = setupWithLogger([TestState]);

    store.dispatch(new ErrorAction());

    const expectedCallStack = LoggerSpy.createCallStack([
      ...formatActionCallStack({ action: InitState.type, prevState: stateModelDefaults }),

      ...formatActionCallStack({
        action: ErrorAction.type,
        prevState: stateModelDefaults,
        error: thrownErrorMessage,
        snapshot: store.snapshot()
      })
    ]);

    expect(logger.callStack).toEqual(expectedCallStack);
  });

  it('should log collapsed success action', () => {
    const { store, logger } = setupWithLogger([TestState], { collapsed: true });

    store.dispatch(new UpdateBarAction());

    const expectedCallStack = LoggerSpy.createCallStack([
      ...formatActionCallStack({
        action: InitState.type,
        prevState: stateModelDefaults,
        collapsed: true
      }),

      ...formatActionCallStack({
        action: UpdateBarAction.type,
        prevState: stateModelDefaults,
        nextState: { bar: defaultBarValue },
        collapsed: true
      })
    ]);

    expect(logger.callStack).toEqual(expectedCallStack);
  });

  it('should not log while disabled', () => {
    const { store, logger } = setupWithLogger([TestState], { disabled: true });

    store.dispatch(new UpdateBarAction());

    const expectedCallStack = LoggerSpy.createCallStack([]);

    expect(logger.callStack).toEqual(expectedCallStack);
  });

  it('should not log if predicate returns false for an action', () => {
    const { store, logger } = setupWithLogger([TestState], {
      filter: action => getActionTypeFromInstance(action) !== UpdateBarAction.type
    });

    const expectedCallStack = LoggerSpy.createCallStack([
      ...formatActionCallStack({ action: InitState.type, prevState: stateModelDefaults })
    ]);

    store.dispatch(new UpdateBarAction());

    expect(logger.callStack).toEqual(expectedCallStack);
  });

  it('should log async success action', async () => {
    const { store, logger } = setupWithLogger([TestState]);
    const payload = 'qux';

    const promise = store.dispatch(new AsyncAction(payload)).toPromise();
    logger.log('Some other work');
    await promise;

    const expectedCallStack = LoggerSpy.createCallStack([
      ...formatActionCallStack({ action: InitState.type, prevState: stateModelDefaults }),
      ['group', 'action ASYNC_ACTION (started @ )'],
      ['log', '%c payload', 'color: #9E9E9E; font-weight: bold', { bar: payload }],
      [
        'log',
        '%c prev state',
        'color: #9E9E9E; font-weight: bold',
        { test: stateModelDefaults }
      ],
      [
        'log',
        '%c next state (synchronous)',
        'color: #4CAF50; font-weight: bold',
        { test: { bar: '...' } }
      ],
      [
        'log',
        '%c ( action doing async work... )',
        'color: #4CAF50; font-weight: bold',
        undefined
      ],
      ['groupEnd'],
      ['log', 'Some other work'],
      ['group', '(async work completed) action ASYNC_ACTION (started @ )'],
      [
        'log',
        '%c next state',
        'color: #4CAF50; font-weight: bold',
        { test: { bar: payload } }
      ],
      ['groupEnd']
    ]);

    expect(logger.callStack).toEqual(expectedCallStack);
  });

  it('should log async error action', async () => {
    const { store, logger } = setupWithLogger([TestState]);
    const errorMessage = 'qux error';

    const promise = store.dispatch(new AsyncError(errorMessage)).toPromise();
    logger.log('Some other work');
    try {
      await promise;
    } catch {}

    const expectedCallStack = LoggerSpy.createCallStack([
      ...formatActionCallStack({ action: InitState.type, prevState: stateModelDefaults }),
      ['group', 'action ASYNC_ERROR (started @ )'],
      ['log', '%c payload', 'color: #9E9E9E; font-weight: bold', { message: errorMessage }],
      [
        'log',
        '%c prev state',
        'color: #9E9E9E; font-weight: bold',
        { test: stateModelDefaults }
      ],
      [
        'log',
        '%c next state (synchronous)',
        'color: #4CAF50; font-weight: bold',
        { test: { bar: '...' } }
      ],
      [
        'log',
        '%c ( action doing async work... )',
        'color: #4CAF50; font-weight: bold',
        undefined
      ],
      ['groupEnd'],
      ['log', 'Some other work'],
      ['group', '(async work error) action ASYNC_ERROR (started @ )'],
      [
        'log',
        '%c next state after error',
        'color: #FD8182; font-weight: bold',
        { test: { bar: 'erroring' } }
      ],
      ['log', '%c error', 'color: #FD8182; font-weight: bold', new Error(errorMessage)],
      ['groupEnd']
    ]);

    expect(logger.callStack).toEqual(expectedCallStack);
  });

  it('should pass state snapshot to filter predicate', () => {
    const { store, logger } = setupWithLogger([TestState], {
      filter: (_, state) => state.test.bar
    });

    const expectedCallStack = LoggerSpy.createCallStack([
      ...formatActionCallStack({
        action: UpdateBarAction.type,
        prevState: { bar: defaultBarValue },
        payload: { bar: 'bar' },
        nextState: { bar: 'bar' }
      })
    ]);

    store.dispatch(new UpdateBarAction());
    store.dispatch(new UpdateBarAction('bar'));

    expect(logger.callStack).toEqual(expectedCallStack);
  });
});
