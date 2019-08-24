import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';

import { NgxsModule, Store, State, Action, StateContext } from '@ngxs/store';
import { NoopErrorHandler } from '@ngxs/store/tests/helpers/utils';
import { StateClass } from '@ngxs/store/internals';

import { NgxsLoggerPluginModule, NgxsLoggerPluginOptions } from '../';
import { LoggerSpy } from './helpers';

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
  class TestState {
    @Action(UpdateBarAction)
    updateBar({ patchState }: StateContext<StateModel>, { bar }: UpdateBarAction) {
      patchState({ bar: bar || defaultBarValue });
    }

    @Action(ErrorAction)
    error() {
      return throwError(new Error(thrownErrorMessage));
    }
  }

  function setup(states: StateClass[], opts?: NgxsLoggerPluginOptions) {
    const logger = new LoggerSpy();

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot(states),
        NgxsLoggerPluginModule.forRoot({
          ...opts,
          logger
        })
      ],
      providers: [{ provide: ErrorHandler, useClass: NoopErrorHandler }]
    });

    const store: Store = TestBed.get(Store);

    return {
      store,
      logger
    };
  }

  it('should log init action success with colors', () => {
    // Arrange & Act
    const { store, logger } = setup([TestState]);
    const initialState = store.selectSnapshot(state => state);
    // Assert
    const expectedCallStack = [
      ['group', 'action @@INIT @ '],
      ['log', '%c prev state', 'color: #9E9E9E; font-weight: bold', initialState],
      ['log', '%c next state', 'color: #4CAF50; font-weight: bold', initialState],
      ['groupEnd']
    ];
    expect(logger.getCallStack()).toEqual(expectedCallStack);
  });

  it('should log success action with colors', () => {
    // Arrange
    const { store, logger } = setup([TestState]);
    logger.clear();
    const initialState = store.selectSnapshot(state => state);

    // Act
    store.dispatch(new UpdateBarAction());

    // Assert
    const newState = store.selectSnapshot(state => state);
    const expectedCallStack = [
      ['group', 'action UPDATE_BAR @ '],
      ['log', '%c prev state', 'color: #9E9E9E; font-weight: bold', initialState],
      ['log', '%c next state', 'color: #4CAF50; font-weight: bold', newState],
      ['groupEnd']
    ];
    expect(logger.getCallStack()).toEqual(expectedCallStack);
  });

  it('should log success action with payload', () => {
    // Arrange
    const { store, logger } = setup([TestState]);
    logger.clear();
    const payload = 'qux';

    // Act
    store.dispatch(new UpdateBarAction(payload));

    // Assert
    const expectedCallStack = [
      ['group', 'action UPDATE_BAR @ '],
      ['log', '%c payload', 'color: #9E9E9E; font-weight: bold', { bar: 'qux' }],
      ['log', '%c prev state', 'color: #9E9E9E; font-weight: bold', { test: { bar: '' } }],
      ['log', '%c next state', 'color: #4CAF50; font-weight: bold', { test: { bar: 'qux' } }],
      ['groupEnd']
    ];
    expect(logger.getCallStack()).toEqual(expectedCallStack);
  });

  it('should log error action with colors', () => {
    // Arrange
    const { store, logger } = setup([TestState]);
    logger.clear();

    // Act
    store.dispatch(new ErrorAction());

    // Assert
    const expectedCallStack = [
      ['group', 'action ERROR @ '],
      ['log', '%c prev state', 'color: #9E9E9E; font-weight: bold', { test: { bar: '' } }],
      [
        'log',
        '%c next state after error',
        'color: #FD8182; font-weight: bold',
        { test: { bar: '' } }
      ],
      ['log', '%c error', 'color: #FD8182; font-weight: bold', new Error('Error')],
      ['groupEnd']
    ];

    expect(logger.getCallStack()).toEqual(expectedCallStack);
  });

  it('should log collapsed success action', () => {
    // Arrange
    const { store, logger } = setup([TestState], { collapsed: true });
    logger.clear();

    // Act
    store.dispatch(new UpdateBarAction());

    // Assert
    const expectedCallStack = [
      ['groupCollapsed', 'action UPDATE_BAR @ '],
      ['log', '%c prev state', 'color: #9E9E9E; font-weight: bold', { test: { bar: '' } }],
      ['log', '%c next state', 'color: #4CAF50; font-weight: bold', { test: { bar: 'baz' } }],
      ['groupEnd']
    ];
    expect(logger.getCallStack()).toEqual(expectedCallStack);
  });

  it('should not log while disabled', () => {
    // Arrange
    const { store, logger } = setup([TestState], { disabled: true });

    // Act
    store.dispatch(new UpdateBarAction());

    // Assert
    expect(logger.getCallStack()).toEqual([]);
  });
});
