import { ApplicationRef } from '@angular/core';
import { TestBed, TestBedStatic } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { ɵBrowserDomAdapter as BrowserDomAdapter } from '@angular/platform-browser';
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
        return TestBed.inject(Store);
      },
      get getTestBed(): TestBedStatic {
        return TestBed;
      }
    };
  }

  private static ngxsBootstrap(): void {
    NgxsTestBed.createRootNode();
    NgxsTestModule.ngDoBootstrap(TestBed.inject(ApplicationRef));
  }

  private static resetTestBed(): void {
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  }

  private static createRootNode(selector = 'app-root'): void {
    const document = TestBed.inject(DOCUMENT);
    const adapter = new BrowserDomAdapter();
    const root = adapter.createElement(selector);
    document.body.appendChild(root);
  }
}
