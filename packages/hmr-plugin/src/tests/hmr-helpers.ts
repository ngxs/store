import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { Type } from '@angular/core';

import { Actions, Store } from '../../../store/src/public_api';
import { MockState, WebpackMockModule } from './hmr-mock';
import { BootstrapModuleFn, hmr } from '../public_api';

export function setup<T>(moduleType: Type<T>) {
  TestBed.resetTestEnvironment();
  TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  const bootstrap: BootstrapModuleFn<T> = () =>
    getTestBed().platform.bootstrapModule(moduleType);
  MockState.clear();
  return { bootstrap };
}

export async function hmrTestBed<T>(moduleType: Type<T>, options: { storedValue?: any } = {}) {
  const { bootstrap } = setup(moduleType);
  const webpackModule = new WebpackMockModule();

  const snapshotContainer: { snapshot?: any } = webpackModule.hot.data;
  snapshotContainer.snapshot = options.storedValue;
  const appModule = await hmr(webpackModule, bootstrap);
  const actions$ = appModule.injector.get<Actions>(Actions);
  const store = appModule.injector.get<Store>(Store);
  const getStoredValue = () => snapshotContainer.snapshot;
  return { appModule, actions$, store, getStoredValue, webpackModule };
}
