import { NgxsAfterBootstrap, NgxsOnInit, State, StateContext } from '@ngxs/store';
import { NgxsTestBed } from '@ngxs/store/internals/testing';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';

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
      ngxsOptions: { defaultsState: { foo: 'baz' } }
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

  it('should be correct testing lifecycle with NgxsTestBed + imports', () => {
    const { store } = NgxsTestBed.configureTestingStates({
      states: [AppState],
      imports: [NgxsStoragePluginModule.forRoot({ key: '@@STATE' })],
      ngxsOptions: {
        defaultsState: {
          app: {
            count: 0
          }
        }
      }
    });

    // TODO: need fix https://github.com/ngxs/store/issues/917
    expect(store.snapshot()).toEqual({
      app: {
        count: 0
      }
    });
  });
});
