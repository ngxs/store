import {
  Action,
  DispatchOutsideZoneNgxsExecutionStrategy,
  NgxsModule,
  State,
  StateContext,
  Store
} from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { TestBed } from '@angular/core/testing';

import { ReduxDevtoolsMockConnector } from './utils/redux-connector';
import { createReduxDevtoolsExtension } from './utils/create-devtools';
import { Injectable } from '@angular/core';

describe('[TEST]: Devtools with custom settings', () => {
  let store: Store;

  @State({
    name: 'count',
    defaults: 0
  })
  @Injectable()
  class CountState {
    @Action({ type: 'increment' })
    increment(ctx: StateContext<number>) {
      ctx.setState(state => state + 1);
    }
  }

  it('should disable devtools', () => {
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CountState], {
          executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy
        }),
        NgxsReduxDevtoolsPluginModule.forRoot({ disabled: true })
      ]
    });

    store = TestBed.inject(Store);
    store.dispatch({ type: 'increment' });
    expect(store.snapshot()).toEqual({ count: 1 });
  });

  it('should check custom name', () => {
    const devtools = new ReduxDevtoolsMockConnector();
    createReduxDevtoolsExtension(devtools);

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CountState], {
          executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy
        }),
        NgxsReduxDevtoolsPluginModule.forRoot({ name: 'custom', maxAge: 1000 })
      ]
    });

    store = TestBed.inject(Store);

    expect(devtools.options).toEqual({ name: 'custom', maxAge: 1000 });
  });

  it('should trace actions calls', () => {
    const devtools = new ReduxDevtoolsMockConnector();
    createReduxDevtoolsExtension(devtools);

    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([CountState], {
          executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy
        }),
        NgxsReduxDevtoolsPluginModule.forRoot({ trace: true, traceLimit: 10 })
      ]
    });

    store = TestBed.inject(Store);

    expect(devtools.options).toEqual({ name: 'NGXS', trace: true, traceLimit: 10 });
  });
});
