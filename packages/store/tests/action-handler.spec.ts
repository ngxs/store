import { ErrorHandler } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { StateClass } from '@ngxs/store/internals';
import { timer } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Action } from '../src/decorators/action';
import { State } from '../src/decorators/state';
import { StateContext } from '../src/symbols';
import { NgxsModule } from '../src/module';
import { Store } from '../src/store';
import { Actions } from '../src/actions-stream';
import { NoopErrorHandler } from './helpers/utils';
import { VALIDATION_CODE, CONFIG_MESSAGES } from '../src/configs/messages.config';

describe('Action handlers', () => {
  class TestAction {
    static type = 'TestAction';

    constructor(public payload?: any) {}
  }

  type IFooStateModel = { name: string; age?: number; updated?: boolean };

  function setup(config: { stores: StateClass[] }) {
    config = config || {
      stores: []
    };
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot(config.stores)],
      providers: [{ provide: ErrorHandler, useClass: NoopErrorHandler }]
    });

    return {
      store: <Store>TestBed.get(Store),
      actions: <Actions>TestBed.get(Actions)
    };
  }

  describe('for synchronous handlers ', () => {
    it('should throw an exception if @Action() decorator is used with static method', () => {
      try {
        @State({ name: 'counter' })
        class CounterState {
          @Action(TestAction)
          static increment() {}
        }

        new CounterState();
      } catch ({ message }) {
        expect(message).toEqual(CONFIG_MESSAGES[VALIDATION_CODE.ACTION_DECORATOR]());
      }
    });

    it(`should allow for retrieval of the current state`, () => {
      // Arrange
      let currentState: any = null;

      const defaultState = { name: 'current state' };
      @State<IFooStateModel>({ name: 'foo', defaults: defaultState })
      class FooState {
        @Action(TestAction)
        test({ getState }: StateContext<IFooStateModel>) {
          currentState = getState();
        }
      }

      const { store } = setup({ stores: [FooState] });
      // Act
      store.dispatch(new TestAction());
      // Assert
      expect(currentState).toEqual(defaultState);
    });

    it(`should allow for the state to be set`, () => {
      // Arrange
      @State<IFooStateModel>({ name: 'foo', defaults: { name: 'old state' } })
      class FooState {
        @Action(TestAction)
        test({ setState }: StateContext<IFooStateModel>, { payload }: TestAction) {
          setState(payload);
        }
      }

      const { store } = setup({ stores: [FooState] });
      const newState = { name: 'new state' };
      // Act
      store.dispatch(new TestAction(newState));
      // Assert
      const resultState = store.selectSnapshot(FooState);
      expect(resultState).toBe(newState);
    });

    it(`should allow for the state to be set using a function`, () => {
      // Arrange
      @State<IFooStateModel>({ name: 'foo', defaults: { name: 'my state' } })
      class FooState {
        @Action(TestAction)
        test({ setState }: StateContext<IFooStateModel>, { payload }: TestAction) {
          setState((existing: IFooStateModel) => {
            return { ...existing, age: payload, updated: true };
          });
        }
      }

      const { store } = setup({ stores: [FooState] });
      // Act
      store.dispatch(new TestAction(21));
      // Assert
      const resultState = store.selectSnapshot(FooState);
      const expectedState = { name: 'my state', age: 21, updated: true };
      expect(resultState).toEqual(expectedState);
    });

    it(`should allow for patching the state`, () => {
      // Arrange
      @State<IFooStateModel>({ name: 'foo', defaults: { name: 'my state' } })
      class FooState {
        @Action(TestAction)
        test({ patchState }: StateContext<IFooStateModel>, { payload }: TestAction) {
          patchState({ age: payload });
        }
      }

      const { store } = setup({ stores: [FooState] });
      // Act
      store.dispatch(new TestAction(21));
      // Assert
      const resultState = store.selectSnapshot(FooState);
      const expectedState = { name: 'my state', age: 21 };
      expect(resultState).toEqual(expectedState);
    });

    it('should be possible to use symbol as a property for action handlers', () => {
      const increment = Symbol('increment');

      @State<number>({ name: 'counter', defaults: 0 })
      class CounterState {
        @Action(TestAction)
        [increment]({ setState }: StateContext<number>) {
          setState(state => (state += 1));
        }
      }

      const { store } = setup({ stores: [CounterState] });
      store.dispatch(new TestAction());
      const counter = store.selectSnapshot(CounterState);
      expect(counter).toBe(1);
    });
  });

  describe('for asynchronous handlers ', () => {
    it(`should allow for retrieval of the current state during the callback`, fakeAsync(() => {
      // Arrange
      let currentState: any = null;

      const defaultState = { name: 'current state' };
      @State<IFooStateModel>({ name: 'foo', defaults: defaultState })
      class FooState {
        @Action(TestAction)
        test({ getState }: StateContext<IFooStateModel>) {
          return timer(0).pipe(
            tap(() => {
              currentState = getState();
            })
          );
        }
      }

      const { store } = setup({ stores: [FooState] });
      const newState = { name: 'new state' };
      store.dispatch(new TestAction());
      store.reset({ foo: newState });
      // Act
      tick();
      // Assert
      expect(currentState).toBe(newState);
    }));

    it(`should allow for the state to be set during the callback`, fakeAsync(() => {
      // Arrange
      @State<IFooStateModel>({ name: 'foo', defaults: { name: 'old state' } })
      class FooState {
        @Action(TestAction)
        test({ setState }: StateContext<IFooStateModel>, { payload }: TestAction) {
          return timer(0).pipe(
            tap(() => {
              setState(payload);
            })
          );
        }
      }

      const { store } = setup({ stores: [FooState] });
      const newState = { name: 'new state' };
      store.dispatch(new TestAction(newState));
      const stateBeforeAsync = store.selectSnapshot(FooState);
      // Act
      tick();
      // Assert
      const resultState = store.selectSnapshot(FooState);
      expect(resultState).toBe(newState);
      expect(resultState).not.toEqual(stateBeforeAsync);
    }));

    it(`should allow for the state to be set using a function during the callback`, fakeAsync(() => {
      // Arrange
      @State<IFooStateModel>({ name: 'foo', defaults: { name: 'my state' } })
      class FooState {
        @Action(TestAction)
        test({ setState }: StateContext<IFooStateModel>, { payload }: TestAction) {
          return timer(0).pipe(
            tap(() => {
              setState(existing => {
                return { ...existing, age: payload, updated: true };
              });
            })
          );
        }
      }

      const { store } = setup({ stores: [FooState] });
      store.dispatch(new TestAction(21));
      const stateBeforeAsync = store.selectSnapshot(FooState);
      // Act
      tick();
      // Assert
      const resultState = store.selectSnapshot(FooState);
      const expectedState = { name: 'my state', age: 21, updated: true };
      expect(resultState).toEqual(expectedState);
      expect(resultState).not.toEqual(stateBeforeAsync);
    }));

    it(`should allow for patching the state during the callback`, fakeAsync(() => {
      // Arrange
      @State<IFooStateModel>({ name: 'foo', defaults: { name: 'my state' } })
      class FooState {
        @Action(TestAction)
        test({ patchState }: StateContext<IFooStateModel>, { payload }: TestAction) {
          return timer(0).pipe(
            tap(() => {
              patchState({ age: payload });
            })
          );
        }
      }

      const { store } = setup({ stores: [FooState] });
      store.dispatch(new TestAction(21));
      const stateBeforeAsync = store.selectSnapshot(FooState);
      // Act
      tick();
      // Assert
      const resultState = store.selectSnapshot(FooState);
      const expectedState = { name: 'my state', age: 21 };
      expect(resultState).toEqual(expectedState);
      expect(resultState).not.toEqual(stateBeforeAsync);
    }));
  });
});
