import { fakeAsync, getTestBed, TestBed, tick } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { NgModuleRef } from '@angular/core';

import { hmr } from '../hmr-bootstrap';
import { BootstrapModuleType, NGXS_HMR_SNAPSHOT_KEY, NgxsHmrSnapshot } from '../symbols';
import { AppMockModule, mockWebpackModule } from './hmr-mock';
import { HmrInitAction } from '../actions/hmr-init.action';
import { HmrBeforeDestroyAction } from '../actions/hmr-before-destroy.action';

describe('HMR Plugin', () => {
  let bootstrap: BootstrapModuleType<AppMockModule>;
  let hmrSnapshot: Partial<NgxsHmrSnapshot> | any = null;
  let actions$: Actions;

  beforeEach(() => {
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    bootstrap = () => getTestBed().platform.bootstrapModule(AppMockModule);
    sessionStorage.setItem(NGXS_HMR_SNAPSHOT_KEY, '');
    hmrSnapshot = null;
  });

  it('should be correct initialize AppMockModule', async () => {
    const moduleRef = await (await bootstrap)();
    expect(moduleRef.instance.constructor.name).toEqual('AppMockModule');
  });

  it('should be correct bootstrap hmr module when empty snapshot', fakeAsync(async () => {
    const appModule: NgModuleRef<AppMockModule> = await hmr(mockWebpackModule, bootstrap);
    actions$ = appModule.injector.get(Actions);

    actions$
      .pipe(ofActionDispatched(HmrInitAction))
      .subscribe(({ payload }) => (hmrSnapshot = payload));

    tick(1000);
    expect(hmrSnapshot).toBeNull();
  }));

  it('should be correct invoke hmrNgxsStoreOnInit', fakeAsync(async () => {
    sessionStorage.setItem(NGXS_HMR_SNAPSHOT_KEY, JSON.stringify({ works: true }));
    const appModule: NgModuleRef<AppMockModule> = await hmr(mockWebpackModule, bootstrap);
    actions$ = appModule.injector.get(Actions);

    actions$
      .pipe(ofActionDispatched(HmrInitAction))
      .subscribe(({ payload }) => (hmrSnapshot = payload));

    tick(1000);

    expect(hmrSnapshot).toEqual({ works: true });
  }));

  it('should be correct invoke hmrNgxsStoreBeforeOnDestroy', fakeAsync(async () => {
    sessionStorage.setItem(NGXS_HMR_SNAPSHOT_KEY, JSON.stringify({ status: 'working' }));
    const appModule: NgModuleRef<AppMockModule> = await hmr(mockWebpackModule, bootstrap);

    const store = appModule.injector.get(Store);
    actions$ = appModule.injector.get(Actions);

    actions$
      .pipe(ofActionDispatched(HmrInitAction))
      .subscribe(({ payload }) => (hmrSnapshot = payload));

    tick(1000);

    expect(hmrSnapshot).toEqual({ status: 'working' });
    expect(store.snapshot()).toEqual({
      mock_state: { value: 'test' },
      status: 'working'
    });

    tick(1000);
    hmrSnapshot = null;

    actions$
      .pipe(ofActionDispatched(HmrBeforeDestroyAction))
      .subscribe(({ payload }) => (hmrSnapshot = payload));

    await mockWebpackModule.destroyModule();

    tick(1000);

    expect(hmrSnapshot).toEqual({
      mock_state: { value: 'test' },
      status: 'working'
    });
  }));
});
