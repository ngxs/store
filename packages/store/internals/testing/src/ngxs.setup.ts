import { ApplicationRef } from '@angular/core';
import { TestBed, TestBedStatic } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import {
  ɵBrowserDomAdapter as BrowserDomAdapter,
  ɵDomAdapter as DomAdapter
} from '@angular/platform-browser';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { NgxsModule, Store } from '@ngxs/store';

import { NgxsTestModule } from './helpers/ngxs-test.module';
import { NgxsOptionsTesting, NgxsTesting } from './symbol';

export class NgxsTestBed {
  public static configureTestingStates(options: NgxsOptionsTesting): NgxsTesting {
    this.resetTestBed();

    if (options.before) {
      options.before();
    }

    TestBed.configureTestingModule({
      imports: [
        NgxsTestModule,
        NgxsModule.forRoot(options.states || [], options.ngxsOptions || {}),
        ...(options.imports || [])
      ]
    }).compileComponents();

    NgxsTestBed.ngxsBootstrap();

    return {
      get store(): Store {
        return TestBed.get(Store);
      },
      get getTestBed(): TestBedStatic {
        return TestBed;
      }
    };
  }

  private static ngxsBootstrap(): void {
    NgxsTestBed.createRootNode();
    NgxsTestModule.ngDoBootstrap(TestBed.get(ApplicationRef));
  }

  private static resetTestBed(): void {
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  }

  private static createRootNode(selector = 'app-root'): void {
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
