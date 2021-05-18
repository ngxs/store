import { ErrorHandler, Injectable } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { delay, mapTo } from 'rxjs/operators';
import { throwError, of, Subject } from 'rxjs';

import { Action } from '../src/decorators/action';
import { State } from '../src/decorators/state';
import { META_KEY, StateContext } from '../src/symbols';

import { NgxsModule } from '../src/module';
import { Store } from '../src/store';
import { Actions } from '../src/actions-stream';
import {
  ofActionSuccessful,
  ofActionDispatched,
  ofAction,
  ofActionErrored,
  ofActionCanceled,
  ofActionCompleted
} from '../src/operators/of-action';
import { NoopErrorHandler } from './helpers/utils';

describe('Action', () => {
  class Action1 {
    static type = 'ACTION 1';
  }

  class Action2 {
    static type = 'ACTION 2';
  }

  class ErrorAction {
    static type = 'ErrorAction';
  }

  class CancelingAction {
    static type = 'CancelingAction';
  }

  @State({
    name: 'bar'
  })
  @Injectable()
  class BarStore {
    @Action([Action1, Action2])
    foo() {}

    @Action(ErrorAction)
    onError() {
      return throwError(new Error('this is a test error'));
    }

    @Action({ type: 'OBJECT_LITERAL' })
    onObjectLiteral() {
      return of({});
    }

    @Action(CancelingAction, { cancelUncompleted: true })
    barGetsCanceled() {
      return of({}).pipe(delay(0));
    }
  }

  describe('', () => {
    function setup() {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([BarStore])],
        providers: [{ provide: ErrorHandler, useClass: NoopErrorHandler }]
      });

      const store = TestBed.inject(Store);
      const actions = TestBed.inject(Actions);
      return {
        store,
        actions
      };
    }

    it('supports multiple actions', () => {
      // Arrange
      setup();
      // Act
      const meta = (<any>BarStore)[META_KEY];
      // Assert
      expect(meta.actions[Action1.type]).toBeDefined();
      expect(meta.actions[Action2.type]).toBeDefined();
    });

    it('calls actions on dispatch and on complete', fakeAsync(() => {
      // Arrange
      const { store, actions } = setup();
      const callbacksCalled: string[] = [];
      actions.pipe(ofAction(Action1)).subscribe(() => {
        callbacksCalled.push('ofAction');
      });

      actions.pipe(ofActionDispatched(Action1)).subscribe(() => {
        callbacksCalled.push('ofActionDispatched');
      });

      actions.pipe(ofActionSuccessful(Action1)).subscribe(() => {
        callbacksCalled.push('ofActionSuccessful');
        expect(callbacksCalled).toEqual([
          'ofAction',
          'ofActionDispatched',
          'ofAction',
          'ofActionSuccessful'
        ]);
      });

      actions.pipe(ofActionCompleted(Action1)).subscribe(({ result }) => {
        callbacksCalled.push('ofActionCompleted');
        expect(result).toEqual({
          canceled: false,
          error: undefined,
          successful: true
        });
      });

      // Act
      store.dispatch(new Action1()).subscribe(() => {
        expect(callbacksCalled).toEqual([
          'ofAction',
          'ofActionDispatched',
          'ofAction',
          'ofActionSuccessful',
          'ofActionCompleted'
        ]);
      });

      tick(1);
      expect(callbacksCalled).toEqual([
        'ofAction',
        'ofActionDispatched',
        'ofAction',
        'ofActionSuccessful',
        'ofActionCompleted'
      ]);
    }));

    it('calls only the dispatched and error action', fakeAsync(() => {
      // Arrange
      const { store, actions } = setup();
      const callbacksCalled: string[] = [];

      actions.pipe(ofAction(Action1)).subscribe(() => {
        callbacksCalled.push('ofAction[Action1]');
      });
      actions.pipe(ofAction(ErrorAction)).subscribe(() => {
        callbacksCalled.push('ofAction');
      });

      actions.pipe(ofActionDispatched(ErrorAction)).subscribe(() => {
        callbacksCalled.push('ofActionDispatched');
      });

      actions.pipe(ofActionSuccessful(ErrorAction)).subscribe(() => {
        callbacksCalled.push('ofActionSuccessful');
      });

      actions.pipe(ofActionErrored(ErrorAction)).subscribe(() => {
        callbacksCalled.push('ofActionErrored');
        expect(callbacksCalled).toEqual([
          'ofAction',
          'ofActionDispatched',
          'ofAction',
          'ofActionErrored'
        ]);
      });

      actions.pipe(ofActionCompleted(ErrorAction)).subscribe(({ result }) => {
        callbacksCalled.push('ofActionCompleted');
        expect(result).toEqual({
          canceled: false,
          error: Error('this is a test error'),
          successful: false
        });
      });

      // Act
      store.dispatch(new ErrorAction()).subscribe({
        error: () =>
          expect(callbacksCalled).toEqual([
            'ofAction',
            'ofActionDispatched',
            'ofAction',
            'ofActionErrored',
            'ofActionCompleted'
          ])
      });

      tick(1);
      expect(callbacksCalled).toEqual([
        'ofAction',
        'ofActionDispatched',
        'ofAction',
        'ofActionErrored',
        'ofActionCompleted'
      ]);
    }));

    it('calls only the dispatched and canceled action', fakeAsync(() => {
      // Arrange
      const { store, actions } = setup();
      const callbacksCalled: string[] = [];

      actions.pipe(ofAction(CancelingAction)).subscribe(() => {
        callbacksCalled.push('ofAction');
      });

      actions.pipe(ofActionDispatched(CancelingAction)).subscribe(() => {
        callbacksCalled.push('ofActionDispatched');
      });

      actions.pipe(ofActionErrored(CancelingAction)).subscribe(() => {
        callbacksCalled.push('ofActionErrored');
      });

      actions.pipe(ofActionSuccessful(CancelingAction)).subscribe(() => {
        callbacksCalled.push('ofActionSuccessful');
        expect(callbacksCalled).toEqual([
          'ofAction',
          'ofActionDispatched',
          'ofAction',
          'ofActionDispatched',
          'ofAction',
          'ofActionCanceled',
          'ofAction',
          'ofActionSuccessful'
        ]);
      });

      actions.pipe(ofActionCanceled(CancelingAction)).subscribe(() => {
        callbacksCalled.push('ofActionCanceled');
        expect(callbacksCalled).toEqual([
          'ofAction',
          'ofActionDispatched',
          'ofAction',
          'ofActionDispatched',
          'ofAction',
          'ofActionCanceled'
        ]);
      });

      // Act
      store.dispatch([new CancelingAction(), new CancelingAction()]).subscribe(() => {
        expect(callbacksCalled).toEqual([
          'ofAction',
          'ofActionDispatched',
          'ofAction',
          'ofActionDispatched'
        ]);
      });

      tick(1);
      // Assert
      expect(callbacksCalled).toEqual([
        'ofAction',
        'ofActionDispatched',
        'ofAction',
        'ofActionDispatched',
        'ofAction',
        'ofActionCanceled',
        'ofAction',
        'ofActionSuccessful'
      ]);
    }));

    it('should allow the user to dispatch an object literal', () => {
      // Arrange
      const { store, actions } = setup();
      const callbacksCalled: string[] = [];

      actions.pipe(ofActionCompleted({ type: 'OBJECT_LITERAL' })).subscribe(() => {
        callbacksCalled.push('onObjectLiteral');
      });

      // Act
      store.dispatch({ type: 'OBJECT_LITERAL' });
      // Assert
      expect(callbacksCalled).toEqual(['onObjectLiteral']);
    });
  });

  describe('Async Action Scenario', () => {
    class PromiseThatReturnsObs {
      static type = 'PromiseThatReturnsObs';
    }

    class ObservableAction {
      static type = 'ObservableAction';
    }

    class ObsThatReturnsPromise {
      static type = 'ObsThatReturnsPromise';
    }

    class PromiseAction {
      static type = 'PromiseAction';
    }

    function setup() {
      const observable = new Subject();
      const completeObservableFn = () => {
        observable?.complete();
      };

      let resolveFn: (value: unknown) => void;
      const promise = new Promise(resolve => {
        resolveFn = resolve;
      });
      const promiseResolveFn = () => resolveFn?.(null);

      @State({
        name: 'async_state'
      })
      @Injectable()
      class AsyncState {
        @Action(PromiseThatReturnsObs)
        async promiseThatReturnsObs(ctx: StateContext<any>) {
          await promise;
          return ctx.dispatch(ObservableAction);
        }

        @Action(ObsThatReturnsPromise)
        obsThatReturnsPromise() {
          return observable.pipe(mapTo(promise));
        }

        @Action(ObservableAction)
        observableAction() {
          return observable;
        }

        @Action(PromiseAction)
        promiseAction() {
          return promise;
        }
      }

      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([AsyncState])],
        providers: [{ provide: ErrorHandler, useClass: NoopErrorHandler }]
      });

      const store = TestBed.inject(Store);
      const actions = TestBed.inject(Actions);
      return {
        store,
        actions,
        completeObservableFn,
        promiseResolveFn,
        promise
      };
    }

    describe('Promise that returns an observable', () => {
      it('completes when promise is resolved - This documents a bug! - See: ISSUE #1660', fakeAsync(() => {
        // Arrange
        const { store, actions, promiseResolveFn, completeObservableFn } = setup();
        const events: string[] = [];

        actions.pipe(ofActionCompleted(ObservableAction)).subscribe(() => {
          events.push('ObservableAction - Completed');
        });

        // Act
        store
          .dispatch(new PromiseThatReturnsObs())
          .subscribe(() => events.push('PromiseThatReturnsObs - Completed'));

        promiseResolveFn();
        tick();

        // Assert
        expect(events).toEqual(['PromiseThatReturnsObs - Completed']);

        completeObservableFn();
        tick();

        expect(events).toEqual([
          'PromiseThatReturnsObs - Completed',
          'ObservableAction - Completed'
        ]);
      }));
    });

    describe('Observable that returns a promise', () => {
      it('completes when observable is completed - This documents a bug! - See: ISSUE #1660', fakeAsync(() => {
        // Arrange
        const { store, promiseResolveFn, completeObservableFn, promise } = setup();
        const events: string[] = [];

        promise.then(() => {
          events.push('promise - resolved');
        });

        // Act
        store
          .dispatch(new ObsThatReturnsPromise())
          .subscribe(() => events.push('ObsThatReturnsPromise - Completed'));

        completeObservableFn();

        // Assert
        expect(events).toEqual(['ObsThatReturnsPromise - Completed']);

        promiseResolveFn();
        tick();

        expect(events).toEqual(['ObsThatReturnsPromise - Completed', 'promise - resolved']);
      }));
    });
  });
});
