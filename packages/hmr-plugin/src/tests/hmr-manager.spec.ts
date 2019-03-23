import { fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { ofActionDispatched } from '@ngxs/store';

import { NgxsHmrSnapshot } from '../symbols';
import {
  AppMockModule,
  AppMockModuleNoHmrLifeCycle as AppMockNoHmrModule,
  MockState
} from './hmr-mock';
import { HmrInitAction } from '../actions/hmr-init.action';
import { HmrBeforeDestroyAction } from '../actions/hmr-before-destroy.action';
import { hmrTestBed, setup } from './hmr-helpers';

describe('HMR Plugin', () => {
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
    let hmrSnapshot: NgxsHmrSnapshot = { init: 'No value init' };
    const { actions$, webpackModule } = await hmrTestBed(AppMockModule);
    const { acceptInvoked, disposeInvoked } = webpackModule;

    // Act
    actions$
      .pipe(ofActionDispatched(HmrInitAction))
      .subscribe(({ payload }) => (hmrSnapshot = payload));

    tick(1000);
    // Assert
    expect(hmrSnapshot).toEqual({ init: 'No value init' });
    expect(acceptInvoked).toBe(true);
    expect(disposeInvoked).toBe(true);
  }));

  it('should dispatch HmrInitAction', fakeAsync(async () => {
    let hmrSnapshot: NgxsHmrSnapshot = {};

    // Arrange
    const { actions$ } = await hmrTestBed(AppMockModule, {
      storedValue: { works: true }
    });

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
    let hmrSnapshot: NgxsHmrSnapshot = {};

    // Arrange
    const { actions$ } = await hmrTestBed(AppMockNoHmrModule, {
      storedValue: { works: true }
    });

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
    let hmrSnapshot: NgxsHmrSnapshot = {};
    const { actions$, webpackModule } = await hmrTestBed(AppMockNoHmrModule, {
      storedValue: { status: 'working' }
    });

    tick(2000);

    actions$
      .pipe(ofActionDispatched(HmrBeforeDestroyAction))
      .subscribe(({ payload }) => (hmrSnapshot = payload));

    // Act
    await webpackModule.destroyModule();
    tick(1000);

    // Assert
    expect(hmrSnapshot).toEqual({
      mock_state: { value: 'test' },
      status: 'working'
    });
  }));

  it('should dispatch HmrBeforeDestroyAction with custom state if present', fakeAsync(async () => {
    // Arrange
    let hmrSnapshot: NgxsHmrSnapshot = {};
    const { actions$, webpackModule } = await hmrTestBed(AppMockModule, {
      storedValue: { status: 'working' }
    });

    tick(2000);

    actions$
      .pipe(ofActionDispatched(HmrBeforeDestroyAction))
      .subscribe(({ payload }) => (hmrSnapshot = payload));

    // Act
    await webpackModule.destroyModule();
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
    const { store } = await hmrTestBed(AppMockNoHmrModule, {
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
    const { store } = await hmrTestBed(AppMockModule, {
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
    const { getStoredValue, webpackModule } = await hmrTestBed(AppMockNoHmrModule, {
      storedValue: { status: 'working' }
    });
    tick(2000);

    // Act
    await webpackModule.destroyModule();
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
    const { getStoredValue, webpackModule } = await hmrTestBed(AppMockModule, {
      storedValue: { status: 'working' }
    });
    tick(2000);

    // Act
    await webpackModule.destroyModule();
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
    await hmrTestBed(AppMockModule, {
      storedValue: { test: 'test' }
    });
    // Act
    tick(1000);
    // Assert
    expect(MockState.init).toEqual(true);
  }));

  it('should allow state to capture HmrBeforeDestroyAction lifecycle action', fakeAsync(async () => {
    // Arrange
    const { webpackModule } = await hmrTestBed(AppMockModule, {
      storedValue: { test: 'test' }
    });
    MockState.clear();
    tick(1000);
    // Act
    await webpackModule.destroyModule();
    tick(1000);
    // Assert
    expect(MockState.destroy).toEqual(true);
  }));
});
