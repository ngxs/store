import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { delay } from 'rxjs/operators';

import { Action } from '../src/action';
import { State } from '../src/state';
import { META_KEY } from '../src/symbols';

import { throwError, of } from 'rxjs';
import { NgxsModule } from '../src/module';
import { Store } from '../src/store';
import { Actions } from '../src/actions-stream';
import { ofActionCompleted, ofActionDispatched, ofAction, ofActionErrored, ofActionCanceled } from '../src/of-action';

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

    @Action(CancelingAction, { cancelUncompleted: true })
    barGetsCanceled() {
      return of({}).pipe(delay(0));
    }
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([BarStore])]
    });

    store = TestBed.get(Store);
    actions = TestBed.get(Actions);
  });

  it('supports multiple actions', () => {
    const meta = BarStore[META_KEY];

    expect(meta.actions[Action1.type]).toBeDefined();
    expect(meta.actions[Action2.type]).toBeDefined();
  });

  it(
    'calls actions on dispatch and on complete',
    fakeAsync(() => {
      const callbacksCalled = [];

      actions.pipe(ofAction(Action1)).subscribe(action => {
        callbacksCalled.push('ofAction');
      });

      actions.pipe(ofActionDispatched(Action1)).subscribe(action => {
        callbacksCalled.push('ofActionDispatched');
      });

      actions.pipe(ofActionCompleted(Action1)).subscribe(action => {
        callbacksCalled.push('ofActionCompleted');
        expect(callbacksCalled).toEqual(['ofAction', 'ofActionDispatched', 'ofAction', 'ofActionCompleted']);
      });

      store.dispatch(new Action1()).subscribe(() => {
        expect(callbacksCalled).toEqual(['ofAction', 'ofActionDispatched']);
      });

      tick(1);
      expect(callbacksCalled).toEqual(['ofAction', 'ofActionDispatched', 'ofAction', 'ofActionCompleted']);
    })
  );

  it(
    'calls only the dispatched and error action',
    fakeAsync(() => {
      const callbacksCalled = [];

      actions.pipe(ofAction(Action1)).subscribe(action => {
        callbacksCalled.push('ofAction[Action1]');
      });
      actions.pipe(ofAction(ErrorAction)).subscribe(action => {
        callbacksCalled.push('ofAction');
      });

      actions.pipe(ofActionDispatched(ErrorAction)).subscribe(action => {
        callbacksCalled.push('ofActionDispatched');
      });

      actions.pipe(ofActionCompleted(ErrorAction)).subscribe(action => {
        callbacksCalled.push('ofActionCompleted');
      });

      actions.pipe(ofActionErrored(ErrorAction)).subscribe(action => {
        callbacksCalled.push('ofActionErrored');
        expect(callbacksCalled).toEqual(['ofAction', 'ofActionDispatched', 'ofAction', 'ofActionErrored']);
      });

      store.dispatch(new ErrorAction()).subscribe(action => {
        expect(callbacksCalled).toEqual(['ofAction', 'ofActionDispatched']);
      });

      tick(1);
      expect(callbacksCalled).toEqual(['ofAction', 'ofActionDispatched', 'ofAction', 'ofActionErrored']);
    })
  );

  it(
    'calls only the dispatched and canceled action',
    fakeAsync(() => {
      const callbacksCalled = [];

      actions.pipe(ofAction(CancelingAction)).subscribe(action => {
        callbacksCalled.push('ofAction');
      });

      actions.pipe(ofActionDispatched(CancelingAction)).subscribe(action => {
        callbacksCalled.push('ofActionDispatched');
      });

      actions.pipe(ofActionErrored(CancelingAction)).subscribe(action => {
        callbacksCalled.push('ofActionErrored');
      });

      actions.pipe(ofActionCompleted(CancelingAction)).subscribe(action => {
        callbacksCalled.push('ofActionCompleted');
        expect(callbacksCalled).toEqual([
          'ofAction',
          'ofActionDispatched',
          'ofAction',
          'ofActionDispatched',
          'ofAction',
          'ofActionCanceled',
          'ofAction',
          'ofActionCompleted'
        ]);
      });

      actions.pipe(ofActionCanceled(CancelingAction)).subscribe(action => {
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

      store.dispatch([new CancelingAction(), new CancelingAction()]).subscribe(action => {
        expect(callbacksCalled).toEqual(['ofAction', 'ofActionDispatched', 'ofAction', 'ofActionDispatched']);
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
        'ofActionCompleted'
      ]);
    })
  );
});
