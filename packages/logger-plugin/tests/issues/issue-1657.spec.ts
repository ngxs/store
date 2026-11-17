import { Injectable } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { Action, InitState, State, StateContext } from '@ngxs/store';
import { tap, timer } from 'rxjs';

import { setupWithLogger, LoggerSpy, formatActionCallStack } from '../helpers';

describe('https://github.com/ngxs/store/issues/1657', () => {
  class FetchData {
    static type = '[Test] Fetch data';
  }

  interface StateModel {
    count: number;
  }

  const stateModelDefaults: StateModel = {
    count: 0
  };

  @State<StateModel>({
    name: 'test',
    defaults: stateModelDefaults
  })
  @Injectable()
  class TestState {
    @Action(FetchData, { cancelUncompleted: true })
    fetchData({ getState, setState }: StateContext<StateModel>) {
      return timer(100).pipe(
        tap(() => {
          setState({ count: getState().count + 1 });
        })
      );
    }
  }

  it('should close the console group when the action is cancelled', fakeAsync(() => {
    // Arrange & act
    const { store, logger } = setupWithLogger([TestState]);

    // Dispatching the action a second time cancels the first one before its
    // handler completes, so the first action never logs a `next state`.
    // Its console group must still be closed, otherwise every subsequent
    // log stays indented.
    store.dispatch(new FetchData());
    store.dispatch(new FetchData());

    tick(100);

    // Note the ordering: the second dispatch opens its group before the
    // first action's stream is cut off, so the cancelled action's `groupEnd`
    // is logged after the second action's `prev state`. The groups still
    // balance out — every opened group is closed exactly once.
    const expectedCallStack = LoggerSpy.createCallStack([
      ...formatActionCallStack({
        action: InitState.type,
        prevState: stateModelDefaults
      }),
      // The cancelled action: the group is opened, but no `next state` is
      // ever logged for it.
      ['group', `action ${FetchData.type} @ `],
      [
        'log',
        '%c prev state',
        'color: #9E9E9E; font-weight: bold',
        { test: stateModelDefaults }
      ],
      // The second action: its group opens before the first action is cut off.
      ['group', `action ${FetchData.type} @ `],
      [
        'log',
        '%c prev state',
        'color: #9E9E9E; font-weight: bold',
        { test: stateModelDefaults }
      ],
      // The cancelled action's group is closed by `finalize`.
      ['groupEnd'],
      // The second action completes: its `next state` is logged and its
      // group is closed.
      ['log', '%c next state', 'color: #4CAF50; font-weight: bold', { test: { count: 1 } }],
      ['groupEnd']
    ]);

    // Assert
    expect(logger.callStack).toEqual(expectedCallStack);
  }));

  it('should close the console group exactly once when the action completes', fakeAsync(() => {
    // Arrange & act
    const { store, logger } = setupWithLogger([TestState]);

    store.dispatch(new FetchData());

    tick(100);

    const expectedCallStack = LoggerSpy.createCallStack([
      ...formatActionCallStack({
        action: InitState.type,
        prevState: stateModelDefaults
      }),
      ...formatActionCallStack({
        action: FetchData.type,
        prevState: stateModelDefaults,
        nextState: { count: 1 }
      })
    ]);

    // Assert
    expect(logger.callStack).toEqual(expectedCallStack);
  }));
});
