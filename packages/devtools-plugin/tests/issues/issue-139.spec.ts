import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { Action, NgxsModule, State, StateContext, Store } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { delay, of, switchMap } from 'rxjs';

import { ReduxDevtoolsMockConnector } from '../utils/redux-connector';
import { createReduxDevtoolsExtension } from '../utils/create-devtools';

describe('https://github.com/ngxs/store/issues/139', () => {
  class LoadAllQuotes {
    static readonly type = '[Quotes] Load all';
  }

  class LoadQuotesSuccess {
    static readonly type = '[Quotes] Load success';
    constructor(public payload: string[]) {}
  }

  interface QuotesModel {
    quotes: string[];
    busy: boolean;
  }

  const defaults: QuotesModel = { quotes: [], busy: false };

  @State<QuotesModel>({
    name: 'quotes',
    defaults
  })
  @Injectable()
  class QuotesState {
    @Action(LoadAllQuotes)
    loadAll(ctx: StateContext<QuotesModel>) {
      ctx.patchState({ quotes: [], busy: true });
      // Standard async pattern from the issue: fetch, then dispatch a
      // success action. The parent only completes once the child completes.
      return of(null).pipe(
        delay(10),
        switchMap(() => ctx.dispatch(new LoadQuotesSuccess(['a', 'b'])))
      );
    }

    @Action(LoadQuotesSuccess)
    loadSuccess(ctx: StateContext<QuotesModel>, { payload }: LoadQuotesSuccess) {
      ctx.patchState({ quotes: payload, busy: false });
    }
  }

  function setup(logActionLifecycle?: boolean) {
    const devtools = new ReduxDevtoolsMockConnector();
    createReduxDevtoolsExtension(devtools);
    TestBed.configureTestingModule({
      imports: [
        NgxsModule.forRoot([QuotesState]),
        NgxsReduxDevtoolsPluginModule.forRoot(
          logActionLifecycle ? { logActionLifecycle } : undefined
        )
      ]
    });
    const store = TestBed.inject(Store);
    return { devtools, store };
  }

  it('should log actions in completion order when logActionLifecycle is off (the reported bug)', fakeAsync(() => {
    const { devtools, store } = setup();

    store.dispatch(new LoadAllQuotes());
    tick(50);

    // The child completes before the parent, so without the flag the
    // success action is logged before the action that dispatched it.
    expect(devtools.devtoolsStack.map(entry => entry.type)).toEqual([
      '@@INIT',
      '[Quotes] Load success',
      '[Quotes] Load all'
    ]);
  }));

  it('should log actions in dispatch order when logActionLifecycle is on', fakeAsync(() => {
    const { devtools, store } = setup(true);

    store.dispatch(new LoadAllQuotes());
    tick(50);

    expect(devtools.devtoolsStack).toEqual([
      {
        id: 0,
        type: '@@INIT',
        payload: undefined,
        state: undefined,
        newState: { quotes: defaults },
        jumped: false
      },
      {
        id: 1,
        type: '[Quotes] Load all (dispatched)',
        payload: undefined,
        state: { quotes: defaults },
        newState: { quotes: defaults },
        jumped: false
      },
      {
        id: 2,
        type: '[Quotes] Load success (dispatched)',
        payload: ['a', 'b'],
        state: { quotes: defaults },
        newState: { quotes: { quotes: [], busy: true } },
        jumped: false
      },
      {
        id: 3,
        type: '[Quotes] Load success',
        payload: ['a', 'b'],
        state: { quotes: { quotes: [], busy: true } },
        newState: { quotes: { quotes: ['a', 'b'], busy: false } },
        jumped: false
      },
      {
        id: 4,
        type: '[Quotes] Load all',
        payload: undefined,
        state: { quotes: { quotes: ['a', 'b'], busy: false } },
        newState: { quotes: { quotes: ['a', 'b'], busy: false } },
        jumped: false
      }
    ]);
  }));
});
