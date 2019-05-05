import { NgxsAfterBootstrap, NgxsOnInit, State, StateContext } from '@ngxs/store';
import { NgxsTestBed } from '@ngxs/store/experimental/testing';

describe('Full testing NGXS States with NgxsTestBed', () => {
  @State<any>({
    name: 'app',
    defaults: {}
  })
  class AppState implements NgxsOnInit, NgxsAfterBootstrap {
    public ngxsOnInit(ctx: StateContext<any>): void {
      ctx.patchState({ 'AppState.ngxsOnInit': true });
    }

    public ngxsAfterBootstrap(ctx: StateContext<any>): void {
      ctx.patchState({ 'AppState.ngxsAfterBootstrap': true });
    }
  }

  it('should be correct testing lifecycle with NgxsTestBed', () => {
    const { store } = NgxsTestBed.configureTestingState([AppState]);

    expect(store.snapshot()).toEqual({
      app: {
        'AppState.ngxsOnInit': true,
        'AppState.ngxsAfterBootstrap': true
      }
    });
  });
});
