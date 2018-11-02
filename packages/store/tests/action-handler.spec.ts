import { ErrorHandler } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { Action } from '../src/decorators/action';
import { State } from '../src/decorators/state';
import { StateContext } from '../src/symbols';

import { NgxsModule } from '../src/module';
import { Store } from '../src/store';
import { Actions } from '../src/actions-stream';
import { NoopErrorHandler } from './helpers/utils';
import { timer } from 'rxjs';
import { tap } from 'rxjs/operators';

describe('Action handlers', () => {
  class TestAction {
    static type = 'TestAction';
    constructor(public payload?: any) {}
  }

  type _class = { new (...args: any[]) };

  function setup(config: { stores: _class[] }) {
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
    it(`should allow for retrieval of the current state`, () => {
      // Arrange
      let currentState = null;

      const defaultState = { name: 'current state' };
      @State({ name: 'foo', defaults: defaultState })
      class FooState {
        @Action(TestAction)
        test({ getState }: StateContext<any>) {
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
      @State({ name: 'foo', defaults: { name: 'old state' } })
      class FooState {
        @Action(TestAction)
        test({ setState }: StateContext<any>, { payload }: TestAction) {
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

    it(`should allow for patching the state`, () => {
      // Arrange
      @State({ name: 'foo', defaults: { name: 'my state' } })
      class FooState {
        @Action(TestAction)
        test({ patchState }: StateContext<any>, { payload }: TestAction) {
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

    it(`should allow for patching the state using a function`, () => {
      // Arrange
      @State({ name: 'foo', defaults: { name: 'my state' } })
      class FooState {
        @Action(TestAction)
        test({ patchState }: StateContext<any>, { payload }: TestAction) {
          patchState(existing => {
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
  });

  describe('for asynchronous handlers ', () => {
    it(`should allow for retrieval of the current state during the callback`, fakeAsync(() => {
      // Arrange
      let currentState = null;

      const defaultState = { name: 'current state' };
      @State({ name: 'foo', defaults: defaultState })
      class FooState {
        @Action(TestAction)
        test({ getState }: StateContext<any>) {
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
      @State({ name: 'foo', defaults: { name: 'old state' } })
      class FooState {
        @Action(TestAction)
        test({ setState }: StateContext<any>, { payload }: TestAction) {
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

    it(`should allow for patching the state during the callback`, fakeAsync(() => {
      // Arrange
      @State({ name: 'foo', defaults: { name: 'my state' } })
      class FooState {
        @Action(TestAction)
        test({ patchState }: StateContext<any>, { payload }: TestAction) {
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

    it(`should allow for patching the state using a function during the callback`, fakeAsync(() => {
      // Arrange
      @State({ name: 'foo', defaults: { name: 'my state' } })
      class FooState {
        @Action(TestAction)
        test({ patchState }: StateContext<any>, { payload }: TestAction) {
          return timer(0).pipe(
            tap(() => {
              patchState(existing => {
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
  });
});
