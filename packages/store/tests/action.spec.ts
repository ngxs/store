import { ErrorHandler } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { delay } from 'rxjs/operators';
import { throwError, of } from 'rxjs';

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
  ofActionCompleted,
  ofActionExecuting
} from '../src/operators/of-action';
import { NoopErrorHandler } from './helpers/utils';

describe('Action', () => {
  let store: Store;
  let actions: Actions;

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

  class AsyncAction1 {
    static type = 'ASYNC_ACTION 1';
  }

  class AsyncAction2 {
    static type = 'ASYNC_ACTION 2';
  }

  class AsyncAction3 {
    static type = 'ASYNC_ACTION 3';
  }

  class AsyncErrorAction {
    static type = 'ASYNC_ERROR_ACTION';
  }

  @State({
    name: 'bar'
  })
  class BarStore {
    @Action([Action1, Action2])
    foo() {}

    @Action(AsyncAction1)
    asyncAction1() {
      return of({}).pipe(delay(0));
    }

    @Action(AsyncAction2)
    asyncAction2() {
      return of({}).pipe(delay(0));
    }

    @Action(AsyncErrorAction)
    asyncError() {
      return throwError(new Error('this is a test error')).pipe(delay(0));
    }

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
  @State({
    name: 'foo'
  })
  class FooState {
    @Action(AsyncAction1)
    asyncAction1({ dispatch }: StateContext<any>) {
      return dispatch(new AsyncAction2()).pipe(delay(0));
    }

    @Action(AsyncAction2)
    asyncAction2({ dispatch }: StateContext<any>) {
      return dispatch(new AsyncAction3()).pipe(delay(0));
    }

    @Action(AsyncAction3)
    asyncAction3() {
      return of({}).pipe(delay(0));
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([BarStore, FooState])],
      providers: [{ provide: ErrorHandler, useClass: NoopErrorHandler }]
    });

    store = TestBed.get(Store);
    actions = TestBed.get(Actions);
  });

  it('supports multiple actions', () => {
    const meta = (<any>BarStore)[META_KEY];

    expect(meta.actions[Action1.type]).toBeDefined();
    expect(meta.actions[Action2.type]).toBeDefined();
  });

  it('calls actions on dispatch and on complete', fakeAsync(() => {
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

    store.dispatch([new CancelingAction(), new CancelingAction()]).subscribe(() => {
      expect(callbacksCalled).toEqual([
        'ofAction',
        'ofActionDispatched',
        'ofAction',
        'ofActionDispatched'
      ]);
    });

    tick(1);
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
    const callbacksCalled: string[] = [];

    actions.pipe(ofActionCompleted({ type: 'OBJECT_LITERAL' })).subscribe(() => {
      callbacksCalled.push('onObjectLiteral');
    });

    store.dispatch({ type: 'OBJECT_LITERAL' });

    expect(callbacksCalled).toEqual(['onObjectLiteral']);
  });

  describe('ofActionExecuting', () => {
    describe('Single Action', () => {
      describe('sync', () => {
        it('should be executing between dispatch and complete', () => {
          const actionStatus: boolean[] = [];

          actions.pipe(ofActionExecuting(Action1)).subscribe(executing => {
            actionStatus.push(executing);
          });

          store.dispatch(new Action1());
          expect(actionStatus).toEqual([true, false]);
        });

        it('should be executing between dispatch and error', () => {
          const actionStatus: boolean[] = [];

          actions.pipe(ofActionExecuting(ErrorAction)).subscribe(executing => {
            actionStatus.push(executing);
          });

          store.dispatch(new ErrorAction());
          expect(actionStatus).toEqual([true, false]);
        });
      });
      describe('async', () => {
        it('should be executing between dispatch and complete ', fakeAsync(() => {
          const actionStatus: boolean[] = [];

          actions.pipe(ofActionExecuting(AsyncAction1)).subscribe(executing => {
            actionStatus.push(executing);
          });

          store.dispatch(new AsyncAction1());
          tick(1);
          expect(actionStatus).toEqual([true, false]);
        }));

        it('should be executing between dispatch and error', fakeAsync(() => {
          const actionStatus: boolean[] = [];

          actions.pipe(ofActionExecuting(AsyncErrorAction)).subscribe(executing => {
            actionStatus.push(executing);
          });

          store.dispatch(new AsyncErrorAction()).subscribe({
            error: err => {
              expect(err).toBeDefined();
            }
          });

          tick(1);
          expect(actionStatus).toEqual([true, false]);
        }));
      });
    });

    describe('Multiple Actions', () => {
      describe('sync', () => {
        it('should be executing between dispatch and complete', () => {
          const actionStatus: boolean[] = [];

          actions.pipe(ofActionExecuting(Action1, Action2)).subscribe(executing => {
            actionStatus.push(executing);
          });

          store.dispatch(new Action1());
          store.dispatch(new Action2());
          expect(actionStatus).toEqual([true, false]);
        });

        it('should be executing between dispatch and error', () => {
          const actionStatus: boolean[] = [];

          actions.pipe(ofActionExecuting(Action1, ErrorAction)).subscribe(executing => {
            actionStatus.push(executing);
          });

          store.dispatch(new Action1());
          store.dispatch(new ErrorAction());
          expect(actionStatus).toEqual([true, false]);
        });
      });
      describe('async', () => {
        it('should be executing between dispatch and complete ', fakeAsync(() => {
          const actionStatus: boolean[] = [];

          actions.pipe(ofActionExecuting(AsyncAction1, AsyncAction2)).subscribe(executing => {
            actionStatus.push(executing);
          });

          store.dispatch(new AsyncAction1());
          tick(1);
          expect(actionStatus).toEqual([]);
          tick(1);
          store.dispatch(new AsyncAction2());
          tick(1);
          expect(actionStatus).toEqual([true, false]);
        }));

        it('should be executing between dispatch and error', fakeAsync(() => {
          const actionStatus: boolean[] = [];

          actions
            .pipe(ofActionExecuting(AsyncAction1, AsyncErrorAction))
            .subscribe(executing => {
              actionStatus.push(executing);
            });

          store.dispatch(new AsyncAction1());
          tick(1);
          expect(actionStatus).toEqual([]);
          tick(1);
          store.dispatch(new AsyncErrorAction());
          tick(1);
          expect(actionStatus).toEqual([true, false]);
        }));

        it('should be executing when action is dispatched multiple times', fakeAsync(() => {
          const actionStatus: boolean[] = [];

          actions.pipe(ofActionExecuting(AsyncAction1)).subscribe(executing => {
            actionStatus.push(executing);
          });

          store.dispatch(new AsyncAction1());
          expect(actionStatus).toEqual([true]);
          store.dispatch(new AsyncAction1());
          tick(1);
          expect(actionStatus).toEqual([true, true, true, false]);
        }));

        it('should be executing when action is dispatched multiple times (case 2)', fakeAsync(() => {
          const actionStatus: boolean[] = [];

          actions.pipe(ofActionExecuting(AsyncAction1)).subscribe(executing => {
            actionStatus.push(executing);
          });

          store.dispatch(new AsyncAction1());
          store.dispatch(new AsyncAction1());
          expect(actionStatus).toEqual([true, true]);
          tick(1);
          expect(actionStatus).toEqual([true, true, true, false]);
        }));

        fit('should be executing on nested actions', fakeAsync(() => {
          const action1Status: boolean[] = [];
          const action2Status: boolean[] = [];
          const action3Status: boolean[] = [];

          const combinedActionStatus: boolean[] = [];

          actions.pipe(ofActionExecuting(AsyncAction1)).subscribe(executing => {
            action1Status.push(executing);
          });

          actions.pipe(ofActionExecuting(AsyncAction2)).subscribe(executing => {
            action2Status.push(executing);
          });

          actions.pipe(ofActionExecuting(AsyncAction3)).subscribe(executing => {
            action3Status.push(executing);
          });

          actions
            .pipe(ofActionExecuting(AsyncAction1, AsyncAction2, AsyncAction3))
            .subscribe(executing => {
              combinedActionStatus.push(executing);
            });

          store.dispatch(new AsyncAction1());
          tick(1);
          expect(action1Status).toEqual([true, false]);
          expect(action2Status).toEqual([true, false]);
          expect(action3Status).toEqual([true, false]);

          expect(combinedActionStatus).toEqual([true, true, true, false]);
        }));
      });
    });
  });
});
