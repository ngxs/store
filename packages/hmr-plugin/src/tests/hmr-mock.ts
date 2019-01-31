import { Component, NgModule } from '@angular/core';
import {
  BrowserModule,
  ɵBrowserDomAdapter as BrowserDomAdapter,
  ɵDomAdapter as DomAdapter
} from '@angular/platform-browser';
import { NgxsModule, State, StateContext } from '@ngxs/store';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';

import { NgxsHmrLifeCycle, NgxsHmrSnapshot as Snapshot, WebpackModule } from '../symbols';

@State({
  name: 'mock_state',
  defaults: {
    value: 'test'
  }
})
export class MockState {}

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
    ctx.patchState(snapshot);
  }

  public hmrNgxsStoreBeforeOnDestroy(ctx: StateContext<Snapshot>): Partial<Snapshot> {
    return ctx.getState();
  }
}

function createRootNode(selector = 'app-root'): void {
  const document = TestBed.get(DOCUMENT);
  const adapter: DomAdapter = new BrowserDomAdapter();

  const root = adapter.firstChild(
    adapter.content(adapter.createTemplate(`<${selector}></${selector}>`))
  );

  const oldRoots = adapter.querySelectorAll(document, selector);
  oldRoots.forEach(oldRoot => adapter.remove(oldRoot));

  adapter.appendChild(document.body, root);
}

export interface ModuleDispose {
  destroyModule: () => void;
}

export const mockWebpackModule: WebpackModule & ModuleDispose = {
  destroyModule: null,
  hot: {
    accept: () => {},
    dispose: (callback: () => void) => {
      if (!callback.name) {
        mockWebpackModule.destroyModule = callback;
      }
    }
  }
};
