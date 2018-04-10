import { TestBed } from '@angular/core/testing';

import { Action } from '../src/action';
import { State } from '../src/state';
import { META_KEY } from '../src/symbols';
import { NgxsModule } from '../src/module';
import { Store } from '../src/store';
import { Actions } from '../src/actions-stream';
import { ofActionComplete, ofActionDispatched, ofAction } from '../src/of-action';

describe('Action', () => {
  let store: Store;
  let actions: Actions;

  class Action1 {
    static type = 'ACTION 1';
  }

  class Action2 {
    static type = 'ACTION 2';
  }

  @State({
    name: 'bar'
  })
  class BarStore {
    @Action([Action1, Action2])
    foo() {}
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

  it('calls actions on dispatch and on complete', () => {
    let callbackCalledCount = 0;

    actions.pipe(ofAction(Action1)).subscribe(action => {
      callbackCalledCount++;
    });

    actions.pipe(ofActionDispatched(Action1)).subscribe(action => {
      callbackCalledCount++;
    });

    actions.pipe(ofActionComplete(Action1)).subscribe(action => {
      callbackCalledCount++;

      expect(callbackCalledCount).toBe(4);
    });

    store.dispatch(new Action1());
  });
});
