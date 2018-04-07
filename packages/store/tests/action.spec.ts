import { Action } from '../src/action';
import { State } from '../src/state';
import { META_KEY } from '../src/symbols';
import { timer } from 'rxjs/observable/timer';
import { TestBed } from '@angular/core/testing';
import { NgxsModule } from '../src/module';
import { Store } from '../src/store';
import { Actions } from '../src/actions-stream';
import { tap } from 'rxjs/operators';

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
});

describe('Actions', () => {
  it('basic', () => {
    let happened = false;

    class Action1 {
      static type = 'ACTION 1';
    }

    @State({ name: 'Bar' })
    class BarStore {
      @Action(Action1)
      bar() {
        return timer(10).pipe(tap(() => (happened = true)));
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([BarStore])]
    });

    const store = TestBed.get(Store);
    const actions = TestBed.get(Actions);

    actions.subscribe(action => {
      expect(happened).toBeFalsy();
    });

    store.dispatch(new Action1());
  });
});
