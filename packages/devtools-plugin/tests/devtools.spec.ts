import { Action, NgxsModule, State, StateContext, Store } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { TestBed } from '@angular/core/testing';

import { ReduxDevtoolsMockConnector } from './utils/redux-connector';
import { createReduxDevtoolsExtension } from './utils/create-devtools';

describe('[TEST]: Devtools', () => {
  let devtools: ReduxDevtoolsMockConnector;
  let store: Store;

  @State({ name: 'count', defaults: 0 })
  class CountState {
    @Action({ type: 'increment' })
    increment(ctx: StateContext<number>) {
      ctx.setState(state => state + 1);
    }
  }

  beforeEach(() => {
    devtools = new ReduxDevtoolsMockConnector();
    createReduxDevtoolsExtension(devtools);
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CountState]), NgxsReduxDevtoolsPluginModule.forRoot()]
    });

    store = TestBed.get(Store);
  });

  it('should be correct execution redux devtools with catching actions', () => {
    expect(devtools.options).toEqual({ name: 'NGXS' });
    expect(devtools.initialState).toEqual({ count: 0 });
    expect(devtools.devtoolsStack).toEqual([
      {
        id: 0,
        type: '@@INIT',
        payload: undefined,
        state: undefined,
        newState: { count: 0 },
        jumped: false
      }
    ]);

    store.dispatch({ type: 'increment' });
    expect(devtools.devtoolsStack).toEqual([
      {
        id: 0,
        type: '@@INIT',
        payload: undefined,
        state: undefined,
        newState: { count: 0 },
        jumped: false
      },
      {
        id: 1,
        type: 'increment',
        payload: undefined,
        state: { count: 0 },
        newState: { count: 1 },
        jumped: false
      }
    ]);

    store.dispatch({ type: 'increment' });
    expect(devtools.devtoolsStack).toEqual([
      {
        id: 0,
        type: '@@INIT',
        payload: undefined,
        state: undefined,
        newState: { count: 0 },
        jumped: false
      },
      {
        id: 1,
        type: 'increment',
        payload: undefined,
        state: { count: 0 },
        newState: { count: 1 },
        jumped: false
      },
      {
        id: 2,
        type: 'increment',
        payload: undefined,
        state: { count: 1 },
        newState: { count: 2 },
        jumped: false
      }
    ]);

    expect(store.snapshot()).toEqual({ count: 2 });
  });

  it('should be correct jump to state', () => {
    expect(store.snapshot()).toEqual({ count: 0 });

    store.dispatch({ type: 'increment' }); // id - 1, count - 1
    store.dispatch({ type: 'increment' }); // id - 2, count - 2
    store.dispatch({ type: 'increment' }); // id - 3, count - 3
    store.dispatch({ type: 'increment' }); // id - 4, count - 4

    expect(store.snapshot()).toEqual({ count: 4 });

    devtools.jumpToActionById(2);
    expect(store.snapshot()).toEqual({ count: 2 });

    expect(devtools.devtoolsStack).toEqual([
      {
        id: 0,
        type: '@@INIT',
        payload: undefined,
        state: undefined,
        newState: { count: 0 },
        jumped: false
      },
      {
        id: 1,
        type: 'increment',
        payload: undefined,
        state: { count: 0 },
        newState: { count: 1 },
        jumped: false
      },
      {
        id: 2,
        type: 'increment',
        payload: undefined,
        state: { count: 1 },
        newState: { count: 2 },
        jumped: false
      },
      {
        id: 3,
        type: 'increment',
        payload: undefined,
        state: { count: 2 },
        newState: { count: 3 },
        jumped: true
      },
      {
        id: 4,
        type: 'increment',
        payload: undefined,
        state: { count: 3 },
        newState: { count: 4 },
        jumped: true
      }
    ]);

    devtools.jumpToActionById(1);
    expect(store.snapshot()).toEqual({ count: 1 });

    expect(devtools.devtoolsStack).toEqual([
      {
        id: 0,
        type: '@@INIT',
        payload: undefined,
        state: undefined,
        newState: { count: 0 },
        jumped: false
      },
      {
        id: 1,
        type: 'increment',
        payload: undefined,
        state: { count: 0 },
        newState: { count: 1 },
        jumped: false
      },
      {
        id: 2,
        type: 'increment',
        payload: undefined,
        state: { count: 1 },
        newState: { count: 2 },
        jumped: true
      },
      {
        id: 3,
        type: 'increment',
        payload: undefined,
        state: { count: 2 },
        newState: { count: 3 },
        jumped: true
      },
      {
        id: 4,
        type: 'increment',
        payload: undefined,
        state: { count: 3 },
        newState: { count: 4 },
        jumped: true
      }
    ]);

    devtools.jumpToActionById(4);
    expect(store.snapshot()).toEqual({ count: 4 });

    expect(devtools.devtoolsStack).toEqual([
      {
        id: 0,
        type: '@@INIT',
        payload: undefined,
        state: undefined,
        newState: { count: 0 },
        jumped: false
      },
      {
        id: 1,
        type: 'increment',
        payload: undefined,
        state: { count: 0 },
        newState: { count: 1 },
        jumped: false
      },
      {
        id: 2,
        type: 'increment',
        payload: undefined,
        state: { count: 1 },
        newState: { count: 2 },
        jumped: false
      },
      {
        id: 3,
        type: 'increment',
        payload: undefined,
        state: { count: 2 },
        newState: { count: 3 },
        jumped: false
      },
      {
        id: 4,
        type: 'increment',
        payload: undefined,
        state: { count: 3 },
        newState: { count: 4 },
        jumped: false
      }
    ]);
  });
});
