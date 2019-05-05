import { ApplicationRef, ModuleWithProviders } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { NgxsModule, Store } from '@ngxs/store';
import {
  ɵBrowserDomAdapter as BrowserDomAdapter,
  ɵDomAdapter as DomAdapter
} from '@angular/platform-browser';

import { NgxsTestModule } from './helpers/ngxs-test.module';
import { NgxsTesting } from './symbol';

export class NgxsTestBed {
  public static configureTestingState(
    states: any[], // TODO: change to StateClass
    options: Partial<any> = {}, // TODO: change to NgxsConfig
    modules: ModuleWithProviders[] = []
  ): NgxsTesting {
    TestBed.configureTestingModule({
      imports: [NgxsTestModule, NgxsModule.forRoot(states, options), ...modules]
    }).compileComponents();

    NgxsTestBed.createRootNode();
    NgxsTestModule.ngDoBootstrap(TestBed.get(ApplicationRef));

    return {
      get store(): Store {
        return TestBed.get(Store);
      }
    };
  }

  public static createRootNode(selector = 'app-root'): void {
    const document = TestBed.get(DOCUMENT);
    const adapter: DomAdapter = new BrowserDomAdapter();

    const root = adapter.firstChild(
      adapter.content(adapter.createTemplate(`<${selector}></${selector}>`))
    );

    const oldRoots = adapter.querySelectorAll(document, selector);
    oldRoots.forEach(oldRoot => adapter.remove(oldRoot));

    adapter.appendChild(document.body, root);
  }
}
