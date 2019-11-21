import { InjectionToken, Injector, NgModuleRef, OnDestroy, Type } from '@angular/core';
import { fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import {
  hmr,
  NgxsHmrLifeCycle,
  NgxsHmrSnapshot as Snapshot,
  WebpackModule
} from '@ngxs/hmr-plugin';
import { ofActionDispatched, StateContext } from '@ngxs/store';

import {
  AppMockModule,
  AppMockModuleNoHmrLifeCycle,
  AppMockModuleNoHmrLifeCycle as AppMockNoHmrModule,
  MockState
} from './hmr-mock';
import { HmrInitAction } from '../actions/hmr-init.action';
import { HmrBeforeDestroyAction } from '../actions/hmr-before-destroy.action';
import { HmrStateContextFactory } from '../internal/hmr-state-context-factory';
import { hmrTestBed, setup } from './hmr-helpers';
import { NgxsHmrSnapshot } from '../symbols';
import { hmrIsReloaded } from '../utils/externals';
import { setHmrReloadedTo } from '../utils/internals';

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

    expect(hmrIsReloaded()).toEqual(false);

    // Act
    await webpackModule.destroyModule();
    tick(1000);

    expect(hmrIsReloaded()).toEqual(true);

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

  it('check if the state is set correctly ', fakeAsync(async () => {
    class AppV2MockModule extends AppMockModule implements NgxsHmrLifeCycle {
      hmrNgxsStoreOnInit(ctx: StateContext<Snapshot>, snapshot: Partial<Snapshot>) {
        ctx.setState((state: Snapshot) => ({ ...state, ...snapshot, custom: 456 }));
      }
    }

    const { store } = await hmrTestBed(AppV2MockModule, {
      storedValue: { value: 'hello world' }
    });

    expect(store.snapshot()).toEqual({
      value: 'hello world',
      mock_state: { value: 'test' }
    });

    tick(1000);

    expect(store.snapshot()).toEqual({
      value: 'hello world',
      mock_state: { value: 'test' },
      custom: 456
    });
  }));

  it('should be correct handling errors', async () => {
    console.error = () => {}; // silent errors in logs for test

    try {
      await hmr({} as WebpackModule, null as any);
    } catch (e) {
      expect(e.message).toEqual('HMR is not enabled for webpack-dev-server!');
    }

    try {
      const mockNgModuleRef: NgModuleRef<any> = {
        injector: {
          get<T>(_: Type<T> | InjectionToken<T>): T {
            return null as any;
          }
        } as Injector
      } as NgModuleRef<any>;

      new HmrStateContextFactory(mockNgModuleRef);
    } catch (e) {
      expect(e.message).toEqual('Store not found, maybe you forgot to import the NgxsModule');
    }
  });

  it('should be correct destroy old module', async () => {
    expect(hmrIsReloaded()).toEqual(false);
    const { appModule, webpackModule } = await hmrTestBed(AppMockModule);
    expect((appModule as any)['_destroyed']).toEqual(false);

    webpackModule.destroyModule();
    expect((appModule as any)['_destroyed']).toEqual(true);
    expect(hmrIsReloaded()).toEqual(true);
  });

  it('state has to be provided before module is disposed', fakeAsync(async () => {
    const { webpackModule, store } = await hmrTestBed(AppMockModuleNoHmrLifeCycle);
    expect(store.snapshot()).toEqual({
      mock_state: { value: 'test' }
    });

    webpackModule.destroyModule();

    tick(1000);

    const { store: newStore } = await hmrTestBed(AppMockModuleNoHmrLifeCycle);

    expect(newStore.snapshot()).toEqual({
      mock_state: { value: 'test' }
    });
  }));

  it('state has to be provided before module is disposed with calling reset in ngOnDestroy', fakeAsync(async () => {
    class AppMockWithDestroyModule extends AppMockModuleNoHmrLifeCycle implements OnDestroy {
      ngOnDestroy(): void {
        store.reset({});
      }
    }

    const { webpackModule, store } = await hmrTestBed(AppMockWithDestroyModule);

    expect(store.snapshot()).toEqual({
      mock_state: { value: 'test' }
    });

    webpackModule.destroyModule();

    tick(1000);

    const { store: newStore } = await hmrTestBed(AppMockWithDestroyModule);

    expect(newStore.snapshot()).toEqual({
      mock_state: { value: 'test' }
    });
  }));

  it('"isHrmReloaded" should return "true" if app is being destroyed', fakeAsync(async () => {
    let count = 0;

    class AppMockWithDestroyModule extends AppMockModuleNoHmrLifeCycle implements OnDestroy {
      ngOnDestroy(): void {
        if (hmrIsReloaded()) {
          return;
        }

        count++;
      }
    }

    const { webpackModule } = await hmrTestBed(AppMockWithDestroyModule);

    expect(hmrIsReloaded()).toEqual(false);

    webpackModule.destroyModule();

    expect(hmrIsReloaded()).toEqual(true);
    expect(count).toEqual(0);
  }));

  it('should be unique instance state after destroy', async () => {
    const { appModule, webpackModule } = await hmrTestBed(AppMockModuleNoHmrLifeCycle);
    const instance: MockState = appModule.injector.get<MockState>(MockState);

    webpackModule.destroyModule();

    const { appModule: newAppModule } = await hmrTestBed(AppMockModuleNoHmrLifeCycle);
    const newInstance: MockState = newAppModule.injector.get<MockState>(MockState);

    expect(instance !== newInstance).toBeTruthy();
  });

  it('mutate old state in ngOnDestroy', fakeAsync(async () => {
    class AppMockWithDestroyModule extends AppMockModuleNoHmrLifeCycle implements OnDestroy {
      ngOnDestroy(): void {
        (store.snapshot() as any).mock_state.value = 'mutated value';
        (store.snapshot() as any).mock_state.any_fields = 'mutated value';
      }
    }

    const { webpackModule, store } = await hmrTestBed(AppMockWithDestroyModule);

    expect(store.snapshot()).toEqual({
      mock_state: { value: 'test' }
    });

    webpackModule.destroyModule();

    expect(store.snapshot()).toEqual({
      mock_state: { value: 'mutated value', any_fields: 'mutated value' }
    });

    const { store: newStore } = await hmrTestBed(AppMockWithDestroyModule);

    expect(newStore.snapshot()).toEqual({
      mock_state: { value: 'test' }
    });
  }));

  afterEach(() => setHmrReloadedTo(false));
});
