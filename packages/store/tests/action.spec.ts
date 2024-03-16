import { ErrorHandler, Injectable } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
  Actions,
  Action,
  State,
  NgxsModule,
  Store,
  StateContext,
  ofAction,
  ofActionCanceled,
  ofActionCompleted,
  ofActionDispatched,
  ofActionErrored,
  ofActionSuccessful,
  ActionCompletion
} from '@ngxs/store';
import { ɵMETA_KEY } from '@ngxs/store/internals';
import { Observable, of, Subject, throwError } from 'rxjs';
import { delay, map, take, tap } from 'rxjs/operators';

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
    constructor(public readonly id: number) {}
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
      const meta = (<any>BarStore)[ɵMETA_KEY];
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

    it('ofActionErrored should return an action completion result', async () => {
      // Arrange
      const { store, actions } = setup();

      // Act
      const action = new ErrorAction();
      const promise = actions.pipe(ofActionErrored(ErrorAction), take(1)).toPromise();
      store.dispatch(action);
      const completion = await promise;

      // Assert
      expect(completion).toEqual({
        action,
        result: {
          successful: false,
          canceled: false,
          error: expect.objectContaining({
            message: expect.stringMatching(/this is a test error/)
          })
        }
      });
    });

    it('calls only the dispatched and canceled action', fakeAsync(() => {
      // Arrange
      const { store, actions } = setup();
      const callbacksCalled: string[] = [];

      actions.pipe(ofAction(CancelingAction)).subscribe(({ id }: CancelingAction) => {
        callbacksCalled.push('ofAction ' + id);
      });

      actions
        .pipe(ofActionDispatched(CancelingAction))
        .subscribe(({ id }: CancelingAction) => {
          callbacksCalled.push('ofActionDispatched ' + id);
        });

      actions
        .pipe(ofActionErrored(CancelingAction))
        .subscribe((completion: ActionCompletion<CancelingAction>) => {
          callbacksCalled.push('ofActionErrored ' + completion.action.id);
        });

      actions
        .pipe(ofActionSuccessful(CancelingAction))
        .subscribe(({ id }: CancelingAction) => {
          callbacksCalled.push('ofActionSuccessful ' + id);
          expect(callbacksCalled).toEqual([
            'ofAction 1',
            'ofActionDispatched 1',
            'ofAction 2',
            'ofActionDispatched 2',
            'ofAction 1',
            'ofActionCanceled 1',
            'ofAction 2',
            'ofActionSuccessful 2'
          ]);
        });

      actions.pipe(ofActionCanceled(CancelingAction)).subscribe(({ id }: CancelingAction) => {
        callbacksCalled.push('ofActionCanceled ' + id);
        expect(callbacksCalled).toEqual([
          'ofAction 1',
          'ofActionDispatched 1',
          'ofAction 2',
          'ofActionDispatched 2',
          'ofAction 1',
          'ofActionCanceled 1'
        ]);
      });

      // Act
      store.dispatch([new CancelingAction(1), new CancelingAction(2)]).subscribe({
        complete: () => {
          expect(callbacksCalled).toEqual([
            'ofAction 1',
            'ofActionDispatched 1',
            'ofAction 2',
            'ofActionDispatched 2',
            'ofAction 1',
            'ofActionCanceled 1'
          ]);
        }
      });

      tick(1);
      // Assert
      expect(callbacksCalled).toEqual([
        'ofAction 1',
        'ofActionDispatched 1',
        'ofAction 2',
        'ofActionDispatched 2',
        'ofAction 1',
        'ofActionCanceled 1',
        'ofAction 2',
        'ofActionSuccessful 2'
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
      it('completes when observable is resolved', async () => {
        // Do not use `fakeAsync` for this test to mimic the real execution environment.

        // Arrange
        const { store, actions, promiseResolveFn, completeObservableFn, recorder, record } =
          setup();

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
        // Wait for anynomous promise to resolve because we record 'promise resolved'
        // in a microtask which is resolved earlier before the following promise.
        await Promise.resolve();

        // Assert
        expect(recorder).toEqual([
          'promiseThatReturnsObs - start',
          '(promiseResolveFn) called',
          'promise resolved',
          'promiseThatReturnsObs - after promise',
          'observableAction - start'
        ]);

        completeObservableFn();
        await Promise.resolve();

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
          '(completeObservableFn) - end',
          'promiseThatReturnsObs - observable tap',
          'PromiseThatReturnsObs [Completed]',
          'dispatch(PromiseThatReturnsObs) - Completed'
        ]);
      });
    });

    describe('Promise that returns a promise', () => {
      it('completes when inner promise is resolved', async () => {
        // Do not use `fakeAsync` for this test to mimic the real execution environment.

        // Arrange
        const { store, actions, promiseResolveFn, completeObservableFn, recorder, record } =
          setup();

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
        // Wait for anynomous promise to resolve because we record 'promise resolved'
        // in a microtask which is resolved earlier before the following promise.
        await Promise.resolve();

        // Assert
        expect(recorder).toEqual([
          'promiseThatReturnsPromise - start',
          '(promiseResolveFn) called',
          'promise resolved',
          'promiseThatReturnsPromise - after promise',
          'observableAction - start'
        ]);

        completeObservableFn();
        await Promise.resolve();

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
      });
    });

    describe('Observable that returns a promise', () => {
      it('completes when promise is completed', async () => {
        // Do not use `fakeAsync` for this test to mimic the real execution environment.

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
        await Promise.resolve();

        // Assert
        expect(recorder).toEqual([
          'obsThatReturnsPromise - start',
          '(completeObservableFn) - next',
          'obsThatReturnsPromise - observable tap',
          '(completeObservableFn) - complete',
          '(completeObservableFn) - end'
        ]);

        promiseResolveFn();

        // The below expectation is run earlier before the `ObsThatReturnsPromise`
        // action completes.
        await new Promise(resolve => setTimeout(resolve));

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
      });
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

  describe('Cancellable Action Scenario', () => {
    class CancellableAction {
      static type = 'Cancellable';
      constructor(
        public readonly id: number,
        public readonly observable: Observable<string>
      ) {}
    }

    function setup() {
      const recorder: string[] = [];
      const record = (message: string) => recorder.push(message);

      @State({
        name: 'cancellable_action_state'
      })
      @Injectable()
      class AsyncState {
        @Action(CancellableAction, { cancelUncompleted: true })
        cancellableAction(_: StateContext<any>, action: CancellableAction) {
          record(`cancellableAction(${action.id}) - start`);
          return action.observable.pipe(
            tap(() => record(`cancellableAction(${action.id}) - observable tap`))
          );
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
        recorder,
        record
      };
    }

    function recordStream<TValue>(record: (phase: string, value?: TValue) => void) {
      return function (source: Observable<TValue>): Observable<TValue> {
        return new Observable(subscriber => {
          record('subscribe');
          const subscription = source.subscribe({
            next(value) {
              record('next', value);
              subscriber.next(value);
            },
            error(error) {
              record('next', error);
              subscriber.error(error);
            },
            complete() {
              record('complete');
              subscriber.complete();
            }
          });
          return () => {
            record('unsubscribe');
            subscription.unsubscribe();
          };
        });
      };
    }

    function recordedObservable(
      observable1: Subject<string>,
      prefix: string,
      record: (message: string) => number
    ): Observable<string> {
      return observable1.pipe(
        recordStream((phase, value) =>
          record(prefix + ' - ' + phase + (value ? ' ' + value : ''))
        )
      );
    }

    describe('Sequential dispatch', () => {
      it('unsubscribes to first action observable before starting second action', fakeAsync(() => {
        // Arrange
        const { store, recorder, record } = setup();

        const observable1 = new Subject<string>();
        const action1 = new CancellableAction(
          1,
          recordedObservable(observable1, 'action1 obs', record)
        );
        const observable2 = new Subject<string>();
        const action2 = new CancellableAction(
          2,
          recordedObservable(observable2, 'action2 obs', record)
        );

        record('Action 1 - dispatching');
        store.dispatch(action1).subscribe(() => record('Action 1 - dispatch complete'));
        // Act
        record('Action 2 - dispatching');
        store.dispatch(action2).subscribe(() => record('Action 2 - dispatch complete'));

        // Assert
        expect(recorder).toEqual([
          'Action 1 - dispatching',
          'cancellableAction(1) - start',
          'action1 obs - subscribe',
          'Action 2 - dispatching',
          'action1 obs - unsubscribe',
          'cancellableAction(2) - start',
          'action2 obs - subscribe'
        ]);
      }));

      it('sequencing of completions should come back inline with zones strategy', fakeAsync(() => {
        // Arrange
        const { store, recorder, record } = setup();

        const observable1 = new Subject<string>();
        const action1 = new CancellableAction(
          1,
          recordedObservable(observable1, 'action1 obs', record)
        );
        const observable2 = new Subject<string>();
        const action2 = new CancellableAction(
          2,
          recordedObservable(observable2, 'action2 obs', record)
        );

        // Act
        record('Action 1 - dispatching');
        store.dispatch(action1).subscribe({
          next: () => record('Action 1 - dispatch next'),
          complete: () => record('Action 1 - dispatch complete')
        });
        record('Action 2 - dispatching');
        store.dispatch(action2).subscribe({
          next: () => record('Action 2 - dispatch next'),
          complete: () => record('Action 2 - dispatch complete')
        });
        observable1.next('Value1');
        observable2.next('Value2');
        record('complete 2');
        observable2.complete();
        record('complete 1');
        observable1.complete();

        // Assert
        expect(recorder).toEqual([
          'Action 1 - dispatching',
          'cancellableAction(1) - start',
          'action1 obs - subscribe',
          'Action 2 - dispatching',
          'Action 1 - dispatch complete',
          'action1 obs - unsubscribe',
          'cancellableAction(2) - start',
          'action2 obs - subscribe',
          'action2 obs - next Value2',
          'cancellableAction(2) - observable tap',
          'complete 2',
          'action2 obs - complete',
          'Action 2 - dispatch next',
          'Action 2 - dispatch complete',
          'action2 obs - unsubscribe',
          'complete 1'
        ]);
      }));
    });

    describe('Dual dispatch', () => {
      it('dual dispatch should unsubscribe first action and keep second action', fakeAsync(() => {
        // Arrange
        const { store, recorder, record } = setup();

        const observable1 = new Subject<string>();
        const action1 = new CancellableAction(
          1,
          recordedObservable(observable1, 'action1 obs', record)
        );
        const observable2 = new Subject<string>();
        const action2 = new CancellableAction(
          2,
          recordedObservable(observable2, 'action2 obs', record)
        );

        // Act
        record('Action 1 & 2 - dispatching');
        store
          .dispatch([action1, action2])
          .subscribe(() => record('Action 1 & 2 - dispatch complete'));

        // Assert
        expect(recorder).toEqual([
          'Action 1 & 2 - dispatching',
          'cancellableAction(1) - start',
          'action1 obs - subscribe',
          'action1 obs - unsubscribe',
          'cancellableAction(2) - start',
          'action2 obs - subscribe'
        ]);
      }));

      it('dual dispatch should complete when first action is cancelled - unclear requirement!! Bug maybe', fakeAsync(() => {
        // Arrange
        const { store, recorder, record } = setup();

        const observable1 = new Subject<string>();
        const action1 = new CancellableAction(
          1,
          recordedObservable(observable1, 'action1 obs', record)
        );
        const observable2 = new Subject<string>();
        const action2 = new CancellableAction(
          2,
          recordedObservable(observable2, 'action2 obs', record)
        );
        record('Action 1 & 2 - dispatching');
        store.dispatch([action1, action2]).subscribe({
          next: () => record('Action 1 & 2 - dispatch next'),
          complete: () => record('Action 1 & 2 - dispatch complete')
        });

        // Act
        observable1.next('Value1');
        observable2.next('Value2');
        record('complete 2');
        observable2.complete();
        record('complete 1');
        observable1.complete();

        // Assert
        expect(recorder).toEqual([
          'Action 1 & 2 - dispatching',
          'cancellableAction(1) - start',
          'action1 obs - subscribe',
          'action1 obs - unsubscribe',
          'cancellableAction(2) - start',
          'action2 obs - subscribe',
          'Action 1 & 2 - dispatch complete',
          'action2 obs - next Value2',
          'cancellableAction(2) - observable tap',
          'complete 2',
          'action2 obs - complete',
          'action2 obs - unsubscribe',
          'complete 1'
        ]);
      }));
    });
  });
});
