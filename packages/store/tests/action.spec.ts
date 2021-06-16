import { ErrorHandler, Injectable } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { Actions } from '../src/actions-stream';
import { Action } from '../src/decorators/action';
import { State } from '../src/decorators/state';
import { NgxsModule } from '../src/module';
import {
  ofAction,
  ofActionCanceled,
  ofActionCompleted,
  ofActionDispatched,
  ofActionErrored,
  ofActionSuccessful
} from '../src/operators/of-action';
import { Store } from '../src/store';
import { META_KEY, StateContext } from '../src/symbols';
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

    class PromiseThatReturnsPromise {
      static type = 'PromiseThatReturnsPromise';
    }

    class ObservableAction {
      static type = 'ObservableAction';
    }

    class ObsThatReturnsPromise {
      static type = 'ObsThatReturnsPromise';
    }

    class ObsThatReturnsObservable {
      static type = 'ObsThatReturnsObservable';
    }

    class PromiseAction {
      static type = 'PromiseAction';
    }

    function setup() {
      const recorder: string[] = [];
      const record = (message: string) => recorder.push(message);
      const observable = new Subject();
      const completeObservableFn = () => {
        record('(completeObservableFn) - next');
        observable?.next();
        record('(completeObservableFn) - complete');
        observable?.complete();
        record('(completeObservableFn) - end');
      };

      let resolveFn: (value: unknown) => void;
      const promise = new Promise(resolve => {
        resolveFn = resolve;
      }).then(() => record('promise resolved'));

      const promiseResolveFn = () => {
        record('(promiseResolveFn) called');
        resolveFn?.(null);
      };

      @State({
        name: 'async_state'
      })
      @Injectable()
      class AsyncState {
        @Action(PromiseThatReturnsObs)
        async promiseThatReturnsObs(ctx: StateContext<any>) {
          record('promiseThatReturnsObs - start');
          await promise;
          record('promiseThatReturnsObs - after promise');
          return ctx
            .dispatch(ObservableAction)
            .pipe(tap(() => record('promiseThatReturnsObs - observable tap')));
        }

        @Action(PromiseThatReturnsPromise)
        async promiseThatReturnsPromise(ctx: StateContext<any>) {
          record('promiseThatReturnsPromise - start');
          await promise;
          record('promiseThatReturnsPromise - after promise');
          return ctx
            .dispatch(ObservableAction)
            .toPromise()
            .then(() => record('promiseThatReturnsPromise - promise resolving'));
        }

        @Action(ObsThatReturnsPromise)
        obsThatReturnsPromise() {
          record('obsThatReturnsPromise - start');
          return observable.pipe(
            tap(() => record('obsThatReturnsPromise - observable tap')),
            map(async () => {
              return await promise;
            })
          );
        }

        @Action(ObsThatReturnsObservable)
        obsThatReturnsObservable(ctx: StateContext<any>) {
          record('obsThatReturnsObservable - start');
          return observable.pipe(
            tap(() => record('obsThatReturnsObservable - observable tap')),
            map(() => {
              return ctx
                .dispatch(new PromiseAction())
                .pipe(tap(() => record('obsThatReturnsObservable - inner observable tap')));
            })
          );
        }

        @Action(ObservableAction)
        observableAction() {
          record('observableAction - start');
          return observable.pipe(tap(() => record('observableAction - observable tap')));
        }

        @Action(PromiseAction)
        promiseAction() {
          record('promiseAction - start');
          return promise.then(() => record('promiseAction - after promise'));
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
        promise,
        recorder,
        record
      };
    }

    describe('Promise that returns an observable', () => {
      it('completes when observable is resolved', fakeAsync(() => {
        // Arrange
        const {
          store,
          actions,
          promiseResolveFn,
          completeObservableFn,
          recorder,
          record
        } = setup();

        actions.pipe(ofActionCompleted(ObservableAction)).subscribe(() => {
          record('ObservableAction [Completed]');
        });
        actions.pipe(ofActionCompleted(PromiseThatReturnsObs)).subscribe(() => {
          record('PromiseThatReturnsObs [Completed]');
        });

        // Act
        store
          .dispatch(new PromiseThatReturnsObs())
          .subscribe(() => record('dispatch(PromiseThatReturnsObs) - Completed'));

        promiseResolveFn();
        tick();

        // Assert
        expect(recorder).toEqual([
          'promiseThatReturnsObs - start',
          '(promiseResolveFn) called',
          'promise resolved',
          'promiseThatReturnsObs - after promise',
          'observableAction - start'
        ]);

        completeObservableFn();
        tick();

        expect(recorder).toEqual([
          'promiseThatReturnsObs - start',
          '(promiseResolveFn) called',
          'promise resolved',
          'promiseThatReturnsObs - after promise',
          'observableAction - start',
          '(completeObservableFn) - next',
          'observableAction - observable tap',
          '(completeObservableFn) - complete',
          'ObservableAction [Completed]',
          'promiseThatReturnsObs - observable tap',
          'PromiseThatReturnsObs [Completed]',
          'dispatch(PromiseThatReturnsObs) - Completed',
          '(completeObservableFn) - end'
        ]);
      }));
    });

    describe('Promise that returns a promise', () => {
      it('completes when inner promise is resolved', fakeAsync(() => {
        // Arrange
        const {
          store,
          actions,
          promiseResolveFn,
          completeObservableFn,
          recorder,
          record
        } = setup();

        actions.pipe(ofActionCompleted(ObservableAction)).subscribe(() => {
          record('ObservableAction [Completed]');
        });
        actions.pipe(ofActionCompleted(PromiseThatReturnsPromise)).subscribe(() => {
          record('PromiseThatReturnsPromise [Completed]');
        });

        // Act
        store
          .dispatch(new PromiseThatReturnsPromise())
          .subscribe(() => record('dispatch(PromiseThatReturnsPromise) - Completed'));

        promiseResolveFn();
        tick();

        // Assert
        expect(recorder).toEqual([
          'promiseThatReturnsPromise - start',
          '(promiseResolveFn) called',
          'promise resolved',
          'promiseThatReturnsPromise - after promise',
          'observableAction - start'
        ]);

        completeObservableFn();
        tick();

        expect(recorder).toEqual([
          'promiseThatReturnsPromise - start',
          '(promiseResolveFn) called',
          'promise resolved',
          'promiseThatReturnsPromise - after promise',
          'observableAction - start',
          '(completeObservableFn) - next',
          'observableAction - observable tap',
          '(completeObservableFn) - complete',
          'ObservableAction [Completed]',
          '(completeObservableFn) - end',
          'promiseThatReturnsPromise - promise resolving',
          'PromiseThatReturnsPromise [Completed]',
          'dispatch(PromiseThatReturnsPromise) - Completed'
        ]);
      }));
    });

    describe('Observable that returns a promise', () => {
      it('completes when promise is completed', fakeAsync(() => {
        // Arrange
        const {
          store,
          actions,
          promiseResolveFn,
          completeObservableFn,
          promise,
          recorder,
          record
        } = setup();

        promise.then(() => {
          record('promise [resolved]');
        });
        actions.pipe(ofActionCompleted(ObsThatReturnsPromise)).subscribe(() => {
          record('ObsThatReturnsPromise [Completed]');
        });

        // Act
        store
          .dispatch(new ObsThatReturnsPromise())
          .subscribe(() => record('dispatch(ObsThatReturnsPromise) - Completed'));

        completeObservableFn();

        // Assert
        expect(recorder).toEqual([
          'obsThatReturnsPromise - start',
          '(completeObservableFn) - next',
          'obsThatReturnsPromise - observable tap',
          '(completeObservableFn) - complete',
          '(completeObservableFn) - end'
        ]);

        promiseResolveFn();
        tick();

        expect(recorder).toEqual([
          'obsThatReturnsPromise - start',
          '(completeObservableFn) - next',
          'obsThatReturnsPromise - observable tap',
          '(completeObservableFn) - complete',
          '(completeObservableFn) - end',
          '(promiseResolveFn) called',
          'promise resolved',
          'promise [resolved]',
          'ObsThatReturnsPromise [Completed]',
          'dispatch(ObsThatReturnsPromise) - Completed'
        ]);
      }));
    });

    describe('Observable that returns an inner observable', () => {
      it('completes when inner observable is completed', fakeAsync(() => {
        // Arrange
        const {
          store,
          actions,
          promiseResolveFn,
          completeObservableFn,
          promise,
          recorder,
          record
        } = setup();

        promise.then(() => {
          record('promise [resolved]');
        });
        actions.pipe(ofActionCompleted(ObsThatReturnsObservable)).subscribe(() => {
          record('ObsThatReturnsObservable [Completed]');
        });

        // Act
        store
          .dispatch(new ObsThatReturnsObservable())
          .subscribe(() => record('dispatch(ObsThatReturnsObservable) - Completed'));

        completeObservableFn();

        // Assert
        expect(recorder).toEqual([
          'obsThatReturnsObservable - start',
          '(completeObservableFn) - next',
          'obsThatReturnsObservable - observable tap',
          'promiseAction - start',
          '(completeObservableFn) - complete',
          '(completeObservableFn) - end'
        ]);

        promiseResolveFn();
        tick();

        expect(recorder).toEqual([
          'obsThatReturnsObservable - start',
          '(completeObservableFn) - next',
          'obsThatReturnsObservable - observable tap',
          'promiseAction - start',
          '(completeObservableFn) - complete',
          '(completeObservableFn) - end',
          '(promiseResolveFn) called',
          'promise resolved',
          'promise [resolved]',
          'promiseAction - after promise',
          'obsThatReturnsObservable - inner observable tap',
          'ObsThatReturnsObservable [Completed]',
          'dispatch(ObsThatReturnsObservable) - Completed'
        ]);
      }));
    });
  });
});
