import { TestBed } from '@angular/core/testing';

import { Action } from '../src/action';
import { State } from '../src/state';
import { META_KEY } from '../src/symbols';
import { NgxsModule } from '../src/module';
import { Store } from '../src/store';
import { Actions } from '../src/actions-stream';
import { ofActionComplete, ofActionDispatched } from '../src/of-action';

describe('Action', () => {
  it('supports multiple actions', () => {
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

    const meta = BarStore[META_KEY];

    expect(meta.actions[Action1.type]).toBeDefined();
    expect(meta.actions[Action2.type]).toBeDefined();
  });

  it('call action on dispatch and on complete', () => {
    class Action1 {
      static type = 'ACTION 1';
    }

    @State({ name: 'Bar' })
    class BarStore {}

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([BarStore])]
    });

    const store = TestBed.get(Store);
    const actions = TestBed.get(Actions);

    let dispatchCalled = false;

    actions.pipe(ofActionDispatched(Action1)).subscribe(action => {
      dispatchCalled = true;
    });

    actions.pipe(ofActionComplete(Action1)).subscribe(action => {
      expect(dispatchCalled).toBe(true);
    });

    store.dispatch(new Action1());
  });
});
