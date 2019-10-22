import {
  Action,
  NgxsModule,
  NgxsOnChanges,
  NgxsSimpleChange,
  State,
  StateContext,
  Store
} from '@ngxs/store';
import { TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';

describe('ngxsOnChanges', () => {
  it('should be instanceof NgxsSimpleChange', () => {
    const change: NgxsSimpleChange = new NgxsSimpleChange(1, 2, false);
    expect(change.previousValue).toEqual(1);
    expect(change.currentValue).toEqual(2);
    expect(change.firstChange).toEqual(false);
  });

  it('should correct state preservation with simple state', () => {
    class Increment {
      static type = 'INCREMENT';
    }

    class Decrement {
      static type = 'DECREMENT';
    }

    @Injectable()
    class OnlineCloudService {
      public readonly db: NgxsSimpleChange[] = [];
    }

    @State<number>({
      name: 'counter',
      defaults: 0
    })
    class CounterState implements NgxsOnChanges {
      constructor(private apiCloud: OnlineCloudService) {}

      public ngxsOnChanges(change: NgxsSimpleChange): void {
        this.apiCloud.db.push(change);
      }

      @Action(Increment)
      increment({ setState }: StateContext<number>) {
        setState((state: number) => ++state);
      }

      @Action(Decrement)
      decrement({ setState }: StateContext<number>) {
        setState((state: number) => --state);
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CounterState])],
      providers: [OnlineCloudService]
    });

    const store: Store = TestBed.get(Store);

    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Increment());
    store.dispatch(new Decrement());
    store.dispatch(new Increment());

    const cloud: OnlineCloudService = TestBed.get(OnlineCloudService);

    expect(cloud.db).toEqual([
      { previousValue: undefined, currentValue: 0, firstChange: true },
      { previousValue: 0, currentValue: 1, firstChange: false },
      { previousValue: 1, currentValue: 2, firstChange: false },
      { previousValue: 2, currentValue: 3, firstChange: false },
      { previousValue: 3, currentValue: 2, firstChange: false },
      { previousValue: 2, currentValue: 3, firstChange: false }
    ]);
  });

  it('should correct state preservation with deep states', () => {
    const allChangesQueue: NgxsSimpleChange[] = [];
    const parentStateChangesQueue: NgxsSimpleChange[] = [];
    const childStateChangesQueue: NgxsSimpleChange[] = [];

    class PushValue {
      static type = 'Pusher';

      constructor(public payload: string) {}
    }

    @State({
      name: 'b',
      defaults: {
        values: []
      }
    })
    class MyChildState implements NgxsOnChanges {
      public ngxsOnChanges(change: NgxsSimpleChange): void {
        allChangesQueue.push(change);
        childStateChangesQueue.push(change);
      }

      @Action(PushValue)
      push({ setState }: StateContext<any>, { payload }: PushValue) {
        setState((state: any) => ({ values: state.values.concat(payload) }));
      }
    }

    class Append {
      static type = 'Appender';

      constructor(public payload: string) {}
    }

    @State({
      name: 'a',
      defaults: {
        hello: 'world'
      },
      children: [MyChildState]
    })
    class MyState implements NgxsOnChanges {
      public ngxsOnChanges(change: NgxsSimpleChange): void {
        allChangesQueue.push(change);
        parentStateChangesQueue.push(change);
      }

      @Action(Append)
      append({ setState }: StateContext<any>, { payload }: Append) {
        setState((state: any) => ({ ...state, hello: state.hello + payload }));
      }
    }

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([MyState, MyChildState])]
    });

    const store: Store = TestBed.get(Store);
    expect(store.snapshot()).toEqual({ a: { hello: 'world', b: { values: [] } } });

    store.dispatch(new Append(' 2019'));
    expect(store.snapshot()).toEqual({ a: { hello: 'world 2019', b: { values: [] } } });

    store.dispatch(new PushValue('Mark'));
    store.dispatch(new PushValue('Artur'));
    store.dispatch(new PushValue('Max'));

    expect(store.snapshot()).toEqual({
      a: { hello: 'world 2019', b: { values: ['Mark', 'Artur', 'Max'] } }
    });

    store.dispatch(new Append('!!!'));

    expect(store.snapshot()).toEqual({
      a: { hello: 'world 2019!!!', b: { values: ['Mark', 'Artur', 'Max'] } }
    });

    expect(parentStateChangesQueue).toEqual([
      {
        previousValue: undefined,
        currentValue: {
          hello: 'world',
          b: {
            values: []
          }
        },
        firstChange: true
      },
      {
        previousValue: { hello: 'world', b: { values: [] } },
        currentValue: { hello: 'world 2019', b: { values: [] } },
        firstChange: false
      },
      {
        previousValue: { hello: 'world 2019', b: { values: ['Mark', 'Artur', 'Max'] } },
        currentValue: { hello: 'world 2019!!!', b: { values: ['Mark', 'Artur', 'Max'] } },
        firstChange: false
      }
    ]);

    expect(childStateChangesQueue).toEqual([
      {
        previousValue: undefined,
        currentValue: { values: [] },
        firstChange: true
      },
      {
        previousValue: { values: [] },
        currentValue: { values: ['Mark'] },
        firstChange: false
      },
      {
        previousValue: { values: ['Mark'] },
        currentValue: { values: ['Mark', 'Artur'] },
        firstChange: false
      },
      {
        previousValue: { values: ['Mark', 'Artur'] },
        currentValue: { values: ['Mark', 'Artur', 'Max'] },
        firstChange: false
      }
    ]);

    expect(allChangesQueue).toEqual([
      {
        previousValue: undefined,
        currentValue: {
          hello: 'world',
          b: {
            values: []
          }
        },
        firstChange: true
      },
      {
        previousValue: undefined,
        currentValue: {
          values: []
        },
        firstChange: true
      },
      {
        previousValue: { hello: 'world', b: { values: [] } },
        currentValue: { hello: 'world 2019', b: { values: [] } },
        firstChange: false
      },
      {
        previousValue: { values: [] },
        currentValue: { values: ['Mark'] },
        firstChange: false
      },
      {
        previousValue: { values: ['Mark'] },
        currentValue: { values: ['Mark', 'Artur'] },
        firstChange: false
      },
      {
        previousValue: { values: ['Mark', 'Artur'] },
        currentValue: { values: ['Mark', 'Artur', 'Max'] },
        firstChange: false
      },
      {
        previousValue: { hello: 'world 2019', b: { values: ['Mark', 'Artur', 'Max'] } },
        currentValue: { hello: 'world 2019!!!', b: { values: ['Mark', 'Artur', 'Max'] } },
        firstChange: false
      }
    ]);

    store.dispatch([new PushValue('<NG'), new Append('-'), new PushValue('XS>')]);

    const lastThreeEvents: NgxsSimpleChange[] = allChangesQueue.slice().slice(-3);

    expect(lastThreeEvents).toEqual([
      {
        previousValue: { values: ['Mark', 'Artur', 'Max'] },
        currentValue: { values: ['Mark', 'Artur', 'Max', '<NG'] },
        firstChange: false
      },
      {
        previousValue: {
          hello: 'world 2019!!!',
          b: { values: ['Mark', 'Artur', 'Max', '<NG'] }
        },
        currentValue: {
          hello: 'world 2019!!!-',
          b: { values: ['Mark', 'Artur', 'Max', '<NG'] }
        },
        firstChange: false
      },
      {
        previousValue: { values: ['Mark', 'Artur', 'Max', '<NG'] },
        currentValue: { values: ['Mark', 'Artur', 'Max', '<NG', 'XS>'] },
        firstChange: false
      }
    ]);
  });
});
