import { Component, Injectable, NgModule } from '@angular/core';
import {
  BrowserModule,
  ɵBrowserDomAdapter as BrowserDomAdapter
} from '@angular/platform-browser';
import { Action, NgxsModule, State, StateContext } from '@ngxs/store';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';

import { NgxsHmrLifeCycle, NgxsHmrSnapshot as Snapshot, WebpackModule } from '../symbols';
import { HmrInitAction } from '../actions/hmr-init.action';
import { HmrBeforeDestroyAction } from '../actions/hmr-before-destroy.action';

@State({
  name: 'mock_state',
  defaults: {
    value: 'test'
  }
})
@Injectable()
export class MockState {
  public static init: boolean;
  public static destroy: boolean;

  public static clear(): void {
    this.init = false;
    this.destroy = false;
  }

  @Action(HmrInitAction)
  public hmrInit() {
    MockState.init = true;
  }

  @Action(HmrBeforeDestroyAction)
  public hrmBeforeDestroy() {
    MockState.destroy = true;
  }
}

@Component({
  selector: 'app-root',
  template: ''
})
export class AppMockComponent {}

@NgModule({
  imports: [BrowserModule, NgxsModule.forRoot([MockState])],
  declarations: [AppMockComponent],
  bootstrap: [AppMockComponent]
})
export class AppMockModule implements NgxsHmrLifeCycle {
  constructor() {
    createRootNode();
  }

  public hmrNgxsStoreOnInit(ctx: StateContext<Snapshot>, snapshot: Partial<Snapshot>) {
    ctx.patchState({ ...snapshot, custom: 123 });
  }

  public hmrNgxsStoreBeforeOnDestroy(ctx: StateContext<Snapshot>): Partial<Snapshot> {
    return { ...ctx.getState(), customOut: 'abc' };
  }
}

@Component({
  selector: 'app-root',
  template: ''
})
export class AppMockComponent2 {}

@NgModule({
  imports: [BrowserModule, NgxsModule.forRoot([MockState])],
  declarations: [AppMockComponent2],
  bootstrap: [AppMockComponent2]
})
export class AppMockModuleNoHmrLifeCycle {
  constructor() {
    createRootNode();
  }
}

function createRootNode(selector = 'app-root'): void {
  const document = TestBed.inject(DOCUMENT);
  const adapter = new BrowserDomAdapter();
  const root = adapter.createElement(selector);
  document.body.appendChild(root);
}

export class WebpackMockModule implements WebpackModule {
  acceptInvoked: boolean;
  disposeInvoked: boolean;

  hot = {
    data: {},
    accept: () => {
      this.acceptInvoked = true;
    },
    dispose: (callback: (data: any) => void) => {
      this.disposeInvoked = true;
      if (!callback.name) {
        this._destroyModuleCallback = callback;
      }
    }
  };

  private _destroyModuleCallback: (data: any) => void;

  public destroyModule() {
    this._destroyModuleCallback(this.hot.data);
  }
}
