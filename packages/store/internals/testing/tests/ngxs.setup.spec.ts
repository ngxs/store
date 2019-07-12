import { NgxsAfterBootstrap, NgxsOnInit, State, StateContext } from '@ngxs/store';
import { NgxsTestBed } from '@ngxs/store/internals/testing';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { InitialState } from '@ngxs/store/internals';

describe('Full testing NGXS States with NgxsTestBed', () => {
  @State<any>({ name: 'app', defaults: { count: 0 } })
  class AppState implements NgxsOnInit, NgxsAfterBootstrap {
    public ngxsOnInit(ctx: StateContext<any>): void {
      this.triggerLifecycle(ctx, 'AppState.ngxsOnInit');
    }

    public ngxsAfterBootstrap(ctx: StateContext<any>): void {
      this.triggerLifecycle(ctx, 'AppState.ngxsAfterBootstrap');
    }

    private triggerLifecycle(ctx: StateContext<any>, type: string): void {
      ctx.setState((state: any) => ({ ...state, [type]: true, count: state.count + 1 }));
    }
  }

  it('should be correct testing lifecycle with NgxsTestBed', () => {
    const { store } = NgxsTestBed.configureTestingStates({ states: [AppState] });
    expect(store.snapshot()).toEqual({
      app: {
        'AppState.ngxsOnInit': true,
        'AppState.ngxsAfterBootstrap': true,
        count: 2
      }
    });
  });

  it('should be correct testing lifecycle with NgxsTestBed + defaults', () => {
    const { store } = NgxsTestBed.configureTestingStates({
      states: [AppState],
      ngxsOptions: { defaultsState: { app: { fiz: 'baz' }, foo: 'baz' } }
    });

    expect(store.snapshot()).toEqual({
      app: {
        'AppState.ngxsOnInit': true,
        'AppState.ngxsAfterBootstrap': true,
        count: 2
      },
      foo: 'baz'
    });
  });

  it('should be correct testing persistence mode', () => {
    const { store } = NgxsTestBed.configureTestingStates({
      states: [AppState],
      imports: [NgxsStoragePluginModule.forRoot({ key: '@@STATE' })],
      ngxsOptions: {
        defaultsState: { app: { count: 0 }, foo: 'bar' }
      },
      before: () => {
        InitialState.set({ app: { count: 1 } });
      }
    });

    expect(store.snapshot()).toEqual({
      app: { count: 1 },
      foo: 'bar'
    });
  });

  it('should be correct testing default disable persistence mode', () => {
    const { store } = NgxsTestBed.configureTestingStates({
      states: [AppState],
      imports: [NgxsStoragePluginModule.forRoot({ key: '@@STATE' })],
      ngxsOptions: {
        defaultsState: {
          app: {
            anyValue: 0
          }
        }
      }
    });

    expect(store.snapshot()).toEqual({
      app: {
        'AppState.ngxsOnInit': true,
        'AppState.ngxsAfterBootstrap': true,
        count: 2
      }
    });
  });

  describe('should correct restore state', () => {
    class InitialMyState {
      public a: number = null!;
      public b: number = null!;
    }

    @State({
      name: 'myState',
      defaults: new InitialMyState()
    })
    class MyState {}

    it('without initial/default state', () => {
      const { store } = NgxsTestBed.configureTestingStates({ states: [MyState] });
      expect(store.snapshot()).toEqual({
        myState: { a: null, b: null }
      });
    });

    it('with default state', () => {
      const { store } = NgxsTestBed.configureTestingStates({
        states: [MyState],
        ngxsOptions: {
          defaultsState: { defaultValue: 1 }
        }
      });

      expect(store.snapshot()).toEqual({
        defaultValue: 1,
        myState: { a: null, b: null }
      });
    });

    it('with initial state', () => {
      InitialState.set({ defaultValue: 2 });

      const { store } = NgxsTestBed.configureTestingStates({
        states: [MyState]
      });

      expect(store.snapshot()).toEqual({
        defaultValue: 2,
        myState: { a: null, b: null }
      });
    });
  });
});
