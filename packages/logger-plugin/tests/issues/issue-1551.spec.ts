import { InitState, State } from '@ngxs/store';

import { setupWithLogger, LoggerSpy, formatActionCallStack } from '../helpers';

describe('https://github.com/ngxs/store/issues/1551', () => {
  class RemoveTodo {
    static type = '[Todos] Remove todo';
    constructor(public payload: number | null) {}
  }

  interface StateModel {
    todos: any[];
  }

  const stateModelDefaults: StateModel = {
    todos: []
  };

  @State<StateModel>({
    name: 'test',
    defaults: stateModelDefaults
  })
  class TodosState {}

  it('should not filter out numbers', () => {
    // Arrange & act
    const { store, logger } = setupWithLogger([TodosState]);

    store.dispatch(new RemoveTodo(0));

    const expectedCallStack = LoggerSpy.createCallStack([
      ...formatActionCallStack({
        action: InitState.type,
        prevState: stateModelDefaults
      }),
      ...formatActionCallStack({
        action: RemoveTodo.type,
        prevState: stateModelDefaults,
        nextState: stateModelDefaults,
        payload: { payload: 0 }
      })
    ]);

    // Assert
    expect(logger.callStack).toEqual(expectedCallStack);
  });

  it('should not filter out nully values', () => {
    // Arrange & act
    const { store, logger } = setupWithLogger([TodosState]);

    store.dispatch(new RemoveTodo(null));

    const expectedCallStack = LoggerSpy.createCallStack([
      ...formatActionCallStack({
        action: InitState.type,
        prevState: stateModelDefaults
      }),
      ...formatActionCallStack({
        action: RemoveTodo.type,
        prevState: stateModelDefaults,
        nextState: stateModelDefaults,
        payload: { payload: null }
      })
    ]);

    // Assert
    expect(logger.callStack).toEqual(expectedCallStack);
  });
});
