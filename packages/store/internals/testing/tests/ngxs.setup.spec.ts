import { NgxsAfterBootstrap, NgxsOnInit, State, StateContext } from '@ngxs/store';
import { NgxsTestBed } from '@ngxs/store/internals/testing';
import { ɵInitialState } from '@ngxs/store/internals';
import { Injectable } from '@angular/core';

describe('Full testing NGXS States with NgxsTestBed', () => {
  @State<any>({ name: 'app', defaults: { count: 0 } })
  @Injectable()
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

  describe('should correct restore state', () => {
    class InitialMyState {
      public a: number = null!;
      public b: number = null!;
    }

    @State({
      name: 'myState',
      defaults: new InitialMyState()
    })
    @Injectable()
    class MyState {}

    it('without initial/default state', () => {
      const { store } = NgxsTestBed.configureTestingStates({ states: [MyState] });
      expect(store.snapshot()).toEqual({
        myState: { a: null, b: null }
      });
    });

    it('with initial state', () => {
      ɵInitialState.set({ defaultValue: 2 });

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
