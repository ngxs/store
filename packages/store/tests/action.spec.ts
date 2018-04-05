import { Action, ActionToken } from '../src/action';
import { State } from '../src/state';
import { META_KEY } from '../src/symbols';
import { timer } from 'rxjs/observable/timer';
import { TestBed } from '@angular/core/testing';
import { NgxsModule } from '../src/module';
import { Store } from '../src/store';
import { ActionCompletions } from '../src/actions-completion-stream';
import { tap } from 'rxjs/operators';

describe('Action', () => {
  it('supports multiple actions', () => {
    class Action1 {
      static type = 'ACTION 1';
    }

    class Action2 {}

    @State({
      name: 'bar'
    })
    class BarStore {
      @Action([Action1, Action2])
      foo() {}
    }

    const meta = BarStore[META_KEY];

    expect(meta.actions[Action1.type]).toBeDefined();
    expect(meta.actions[(<ActionToken>Action2['type']).toString()]).toBeDefined();

    // NOTE: becuase Jasmine type will change when more actions are added to tests.
    expect((<ActionToken>Action2['type']).toString()).toBe('ActionToken Action2 5');
  });
});

describe('Actions', () => {
  fit('basic', () => {
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
    const actions = TestBed.get(ActionCompletions);
    store.dispatch(new Action1());

    actions.subscribe(action => expect(happened).toBeFalsy());
  });
});

describe('Action Completions', () => {
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
    const actions = TestBed.get(ActionCompletions);
    store.dispatch(new Action1());

    actions.subscribe(action => expect(happened).toBeTruthy());
  });
});
