import { Component, NgModule, Injectable } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { Router, RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { Observable } from 'rxjs';

import { NgxsRouterPluginModule } from '@ngxs/router-plugin';
import { NgxsModule, NgxsOnInit, State, StateContext, Store } from '@ngxs/store';
import { freshPlatform, skipConsoleLogging } from '@ngxs/store/internals/testing';
import { ɵDEFAULT_STATE_KEY } from '@ngxs/storage-plugin/internals';

import { NgxsStoragePluginModule } from '../../';

describe('Invalid state re-hydration (https://github.com/ngxs/store/issues/1146)', () => {
  afterEach(() => localStorage.clear());

  beforeEach(() => {
    // Caretaker note: it somehow sets `/@angular-cli-builders` as a default URL, thus when running `initialNavigation()`
    // it errors that there's no route definition for the `/@angular-cli-builders`.
    jest.spyOn(Router.prototype, 'initialNavigation').mockReturnValue(undefined);
  });

  @State({
    name: 'counter',
    defaults: 0
  })
  @Injectable()
  class CounterState implements NgxsOnInit {
    ngxsOnInit(ctx: StateContext<number>) {
      ctx.setState(999);
    }
  }

  @Component({
    selector: 'app-root',
    template: 'Counter: {{ counter$ | async }}'
  })
  class TestComponent {
    counter$: Observable<number>;

    constructor(store: Store) {
      this.counter$ = store.select(CounterState);
    }
  }

  @NgModule({
    imports: [
      BrowserModule,
      NgxsModule.forRoot([CounterState]),
      NgxsStoragePluginModule.forRoot(),
      NgxsRouterPluginModule.forRoot(),
      RouterModule.forRoot([])
    ],
    declarations: [TestComponent],
    bootstrap: [TestComponent],
    providers: [{ provide: APP_BASE_HREF, useValue: '/' }]
  })
  class TestModule {}

  it(
    'should not re-hydrate the counter state if it is been handled before',
    freshPlatform(async () => {
      // Arrange & act
      localStorage.setItem(
        ɵDEFAULT_STATE_KEY,
        JSON.stringify({
          counter: -1,
          router: {
            state: {
              root: {
                url: [],
                params: {},
                queryParams: {},
                fragment: null,
                data: {},
                outlet: 'primary',
                component: null,
                routeConfig: null,
                root: null,
                parent: null,
                children: [],
                pathFromRoot: null,
                paramMap: { params: {} },
                queryParamMap: { params: {} }
              },
              url: '/'
            },
            navigationId: 1,
            trigger: 'none'
          }
        })
      );
      await skipConsoleLogging(() => platformBrowserDynamic().bootstrapModule(TestModule));
      const root = document.querySelector('app-root')!;
      // Assert
      expect(root.innerHTML).toEqual('Counter: 999');
    })
  );
});
