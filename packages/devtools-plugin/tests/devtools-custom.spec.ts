import { Action, NgxsModule, State, StateContext, Store } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { TestBed } from '@angular/core/testing';

import { ReduxDevtoolsMockConnector } from './utils/redux-connector';
import { createReduxDevtoolsExtension } from './utils/create-devtools';

describe('[TEST]: Devtools with custom settings', () => {
  let store: Store;

  @State({ name: 'count', defaults: 0 })
  class CountState {
    @Action({ type: 'increment' })
    increment(ctx: StateContext<number>) {
      ctx.setState(state => state + 1);
    }
  }

  it('should be disable devtools', () => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CountState]),
        NgxsReduxDevtoolsPluginModule.forRoot({ disabled: true })
      ]
    });

    store = TestBed.get(Store);
    store.dispatch({ type: 'increment' });
    expect(store.snapshot()).toEqual({ count: 1 });
  });

  it('should be check custom name', () => {
    const devtools = new ReduxDevtoolsMockConnector();
    createReduxDevtoolsExtension(devtools);

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CountState]),
        NgxsReduxDevtoolsPluginModule.forRoot({ name: 'custom', maxAge: 1000 })
      ]
    });

    store = TestBed.get(Store);

    expect(devtools.options).toEqual({ name: 'custom', maxAge: 1000 });
  });
});
