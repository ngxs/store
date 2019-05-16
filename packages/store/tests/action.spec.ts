import { ErrorHandler } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { delay } from 'rxjs/operators';
import { throwError, of } from 'rxjs';

import { Action } from '../src/decorators/action';
import { State } from '../src/decorators/state';
import { META_KEY } from '../src/symbols';

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

  @State({
    name: 'bar'
  })
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([BarStore])],
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
});
