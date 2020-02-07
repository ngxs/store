import { Action, NgxsModule, State, StateContext, Store } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { TestBed } from '@angular/core/testing';

import { ReduxDevtoolsMockConnector } from './utils/redux-connector';
import { createReduxDevtoolsExtension } from './utils/create-devtools';
import { throwError } from 'rxjs';

describe('[TEST]: Devtools with errors', () => {
  @State({ name: 'count', defaults: 0 })
  class CountState {
    @Action({ type: 'decrement' })
    decrement(ctx: StateContext<number>) {
      ctx.setState(state => --state);
    }

    @Action({ type: 'increment' })
    increment(ctx: StateContext<number>) {
      ctx.setState(state => ++state);
    }

    @Action({ type: 'error' })
    error() {
      return throwError('Error in state');
    }

    @Action({ type: 'error_2' })
    error2(ctx: StateContext<number>) {
      ctx.setState(state => state + 10);
      return throwError('Error_2 in state');
    }
  }

  it('should be correct worked with errors', () => {
    const devtools = new ReduxDevtoolsMockConnector();
    createReduxDevtoolsExtension(devtools);

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CountState]), NgxsReduxDevtoolsPluginModule.forRoot()]
    });

    const store = TestBed.get(Store);

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

    store.dispatch({ type: 'decrement' });

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
        type: 'decrement',
        payload: undefined,
        state: { count: 0 },
        newState: { count: -1 },
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
        type: 'decrement',
        payload: undefined,
        state: { count: 0 },
        newState: { count: -1 },
        jumped: false
      },
      {
        id: 2,
        type: 'increment',
        payload: undefined,
        state: { count: -1 },
        newState: { count: 0 },
        jumped: false
      }
    ]);

    store
      .dispatch({ type: 'error' })
      .subscribe(() => null, (err: Error) => expect(err.message).toEqual('Error in state'));

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
        type: 'decrement',
        payload: undefined,
        state: { count: 0 },
        newState: { count: -1 },
        jumped: false
      },
      {
        id: 2,
        type: 'increment',
        payload: undefined,
        state: { count: -1 },
        newState: { count: 0 },
        jumped: false
      },
      {
        id: 3,
        type: 'error',
        payload: undefined,
        state: { count: 0 },
        newState: { count: 0 },
        jumped: false
      },
      {
        id: 4,
        type: 'error',
        payload: undefined,
        state: { count: 0 },
        newState: { count: 0 },
        jumped: false
      }
    ]);

    store.dispatch({ type: 'increment' });
    expect(store.snapshot()).toEqual({ count: 1 });

    store
      .dispatch({ type: 'error_2' })
      .subscribe(() => null, (err: Error) => expect(err.message).toEqual('Error_2 in state'));

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
        type: 'decrement',
        payload: undefined,
        state: { count: 0 },
        newState: { count: -1 },
        jumped: false
      },
      {
        id: 2,
        type: 'increment',
        payload: undefined,
        state: { count: -1 },
        newState: { count: 0 },
        jumped: false
      },
      {
        id: 3,
        type: 'error',
        payload: undefined,
        state: { count: 0 },
        newState: { count: 0 },
        jumped: false
      },
      {
        id: 4,
        type: 'error',
        payload: undefined,
        state: { count: 0 },
        newState: { count: 0 },
        jumped: false
      },
      {
        id: 5,
        type: 'increment',
        payload: undefined,
        state: { count: 0 },
        newState: { count: 1 },
        jumped: false
      },
      {
        id: 6,
        type: 'error_2',
        payload: undefined,
        state: { count: 1 },
        newState: { count: 11 },
        jumped: false
      },
      {
        id: 7,
        type: 'error_2',
        payload: undefined,
        state: { count: 11 },
        newState: { count: 11 },
        jumped: false
      }
    ]);
  });
});
