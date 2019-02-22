import { fakeAsync, getTestBed, TestBed, tick, flushMicrotasks } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { Type } from '@angular/core';

import { hmr } from '../hmr-bootstrap';
import { BootstrapModuleFn, NGXS_HMR_SNAPSHOT_KEY } from '../symbols';
import {
  AppMockModule,
  MockState,
  mockWebpackModule,
  AppMockModuleNoHmrLifeCycle
} from './hmr-mock';
import { HmrInitAction } from '../actions/hmr-init.action';
import { HmrBeforeDestroyAction } from '../actions/hmr-before-destroy.action';

describe('HMR Plugin', () => {
  function setup<T>(moduleType: Type<T>, options: { storedValue?: any } = {}) {
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    const bootstrap: BootstrapModuleFn<T> = () =>
      getTestBed().platform.bootstrapModule(moduleType);
    const storedValue = options.storedValue;
    const storageValue = options.storedValue ? JSON.stringify(storedValue) : '';
    sessionStorage.setItem(NGXS_HMR_SNAPSHOT_KEY, storageValue);
    MockState.clear();
    return { bootstrap };
  }

  async function setupAndRun<T>(moduleType: Type<T>, options: { storedValue?: any } = {}) {
    const { bootstrap } = setup(moduleType, options);
    const appModule = await hmr(mockWebpackModule, bootstrap);
    const actions$ = appModule.injector.get<Actions>(Actions);
    const store = appModule.injector.get<Store>(Store);
    const getStoredValue = () =>
      JSON.parse(sessionStorage.getItem(NGXS_HMR_SNAPSHOT_KEY) || '{}');
    return { appModule, actions$, store, getStoredValue };
  }

  it('should initialize AppMockModule', async () => {
    // Arrange
    const { bootstrap } = setup(AppMockModule);
    // Act
    const moduleRef = await (await bootstrap)();
    // Assert
    expect(moduleRef.instance.constructor.name).toEqual('AppMockModule');
  });

  it('should skip HmrInitAction when empty snapshot', fakeAsync(async () => {
    // Arrange
    const { actions$ } = await setupAndRun(AppMockModule);
    let hmrSnapshot: any = 'No value init';
    // Act
    actions$
      .pipe(ofActionDispatched(HmrInitAction))
      .subscribe(({ payload }) => (hmrSnapshot = payload));

    tick(1000);
    // Assert
    expect(hmrSnapshot).toEqual('No value init');
  }));

  it('should dispatch HmrInitAction', fakeAsync(async () => {
    // Arrange
    const { actions$ } = await setupAndRun(AppMockModule, {
      storedValue: { works: true }
    });
    let hmrSnapshot: any;

    // Act
    actions$
      .pipe(ofActionDispatched(HmrInitAction))
      .subscribe(({ payload }) => (hmrSnapshot = payload));

    flushMicrotasks();
    tick(1000);

    // Assert
    expect(hmrSnapshot).toEqual({ works: true });
  }));

  it('should still dispatch HmrInitAction if hmrNgxsStoreOnInit not implemented', fakeAsync(async () => {
    // Arrange
    const { actions$ } = await setupAndRun(AppMockModuleNoHmrLifeCycle, {
      storedValue: { works: true }
    });
    let hmrSnapshot: any;

    // Act
    actions$
      .pipe(ofActionDispatched(HmrInitAction))
      .subscribe(({ payload }) => (hmrSnapshot = payload));

    tick(1000);
    // Assert
    expect(hmrSnapshot).toEqual({ works: true });
  }));

  it('should dispatch HmrBeforeDestroyAction with store state by default', fakeAsync(async () => {
    // Arrange
    const { actions$ } = await setupAndRun(AppMockModuleNoHmrLifeCycle, {
      storedValue: { status: 'working' }
    });
    tick(2000);
    let hmrSnapshot: any;
    actions$
      .pipe(ofActionDispatched(HmrBeforeDestroyAction))
      .subscribe(({ payload }) => (hmrSnapshot = payload));

    // Act
    await mockWebpackModule.destroyModule();
    tick(1000);

    // Assert
    expect(hmrSnapshot).toEqual({
      mock_state: { value: 'test' },
      status: 'working'
    });
  }));

  it('should dispatch HmrBeforeDestroyAction with custom state if present', fakeAsync(async () => {
    // Arrange
    const { actions$ } = await setupAndRun(AppMockModule, {
      storedValue: { status: 'working' }
    });
    tick(2000);
    let hmrSnapshot: any;
    actions$
      .pipe(ofActionDispatched(HmrBeforeDestroyAction))
      .subscribe(({ payload }) => (hmrSnapshot = payload));

    // Act
    await mockWebpackModule.destroyModule();
    tick(1000);

    // Assert
    expect(hmrSnapshot).toEqual({
      mock_state: { value: 'test' },
      status: 'working',
      customOut: 'abc',
      custom: 123
    });
  }));

  it('should provide default state patch behaviour if hmrNgxsStoreOnInit not implemented', fakeAsync(async () => {
    // Arrange
    const { store } = await setupAndRun(AppMockModuleNoHmrLifeCycle, {
      storedValue: { status: 'working' }
    });

    // Act
    tick(1000);

    // Assert
    expect(store.snapshot()).toEqual({
      mock_state: { value: 'test' },
      status: 'working'
    });
  }));

  it('should use custom hmrNgxsStoreOnInit to setup state', fakeAsync(async () => {
    // Arrange
    const { store } = await setupAndRun(AppMockModule, {
      storedValue: { status: 'working' }
    });

    // Act
    tick(1000);

    // Assert
    expect(store.snapshot()).toEqual({
      mock_state: { value: 'test' },
      status: 'working',
      custom: 123
    });
  }));

  it('should store all state by default when no hmrNgxsStoreBeforeOnDestroy implemented', fakeAsync(async () => {
    // Arrange
    const { getStoredValue } = await setupAndRun(AppMockModuleNoHmrLifeCycle, {
      storedValue: { status: 'working' }
    });
    tick(2000);

    // Act
    await mockWebpackModule.destroyModule();
    tick(1000);

    // Assert
    const storageValue = getStoredValue();
    expect(storageValue).toEqual({
      mock_state: { value: 'test' },
      status: 'working'
    });
  }));

  it('should store state provided by hmrNgxsStoreBeforeOnDestroy', fakeAsync(async () => {
    // Arrange
    const { getStoredValue } = await setupAndRun(AppMockModule, {
      storedValue: { status: 'working' }
    });
    tick(2000);

    // Act
    await mockWebpackModule.destroyModule();
    tick(1000);

    // Assert
    const storageValue = getStoredValue();
    expect(storageValue).toEqual({
      mock_state: { value: 'test' },
      status: 'working',
      custom: 123,
      customOut: 'abc'
    });
  }));

  it('should allow state to capture HmrInitAction lifecycle action', fakeAsync(async () => {
    // Arrange
    MockState.clear();
    await setupAndRun(AppMockModule, {
      storedValue: { test: 'test' }
    });
    // Act
    tick(1000);
    // Assert
    expect(MockState.init).toEqual(true);
  }));

  it('should allow state to capture HmrBeforeDestroyAction lifecycle action', fakeAsync(async () => {
    // Arrange
    await setupAndRun(AppMockModule, {
      storedValue: { test: 'test' }
    });
    MockState.clear();
    tick(1000);
    // Act
    await mockWebpackModule.destroyModule();
    tick(1000);
    // Assert
    expect(MockState.destroy).toEqual(true);
  }));
});
