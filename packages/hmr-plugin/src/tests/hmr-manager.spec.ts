import { fakeAsync, getTestBed, TestBed, tick } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

import { hmr } from '../hmr-bootstrap';
import { BootstrapModuleType, NGXS_HMR_SNAPSHOT_KEY } from '../symbols';
import { AppMockModule } from './hmr-mock';
import { HmrManager } from '../hmr-manager';

describe('HMR Plugin', () => {
  let bootstrap: BootstrapModuleType<AppMockModule>;

  beforeEach(() => {
    TestBed.resetTestEnvironment();
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
  });

  beforeEach(() => {
    bootstrap = () => getTestBed().platform.bootstrapModule(AppMockModule);
  });

  it('should be correct initialize AppMockModule', async () => {
    const moduleRef = await (await bootstrap)();
    expect(moduleRef.instance.constructor.name).toEqual('AppMockModule');
  });

  it('should be correct bootstrap hmr module when empty snapshot', fakeAsync(async () => {
    let hmrRef: HmrManager<AppMockModule, any> | null = null;

    await hmr(module, bootstrap, {
      hmrAfterOnInit: (manager: HmrManager<AppMockModule, any>) => {
        hmrRef = manager;
      }
    });

    tick(1000);

    /**
     * When snapshot is empty,
     * hmrAfterOnInit not called
     */
    expect(hmrRef).toEqual(null);
  }));

  it('should be correct invoke hmrNgxsStoreOnInit', fakeAsync(async () => {
    let hmrRef: HmrManager<AppMockModule, any> | null = null;
    sessionStorage.setItem(NGXS_HMR_SNAPSHOT_KEY, JSON.stringify({ works: true }));

    await hmr(module, bootstrap, {
      hmrAfterOnInit: (manager: HmrManager<AppMockModule, any>) => {
        hmrRef = manager;
        expect(hmrRef!.snapshot).toEqual({ works: true });
      }
    });

    tick(1000);

    expect(hmrRef!.snapshot).toEqual({});
    expect(hmrRef!.store.snapshot()).toEqual({ mock_state: { value: 'test' }, works: true });
    expect(hmrRef!.status.onInitIsCalled).toEqual(true);
    expect(hmrRef!.status.beforeOnDestroyIsCalled).toEqual(false);
  }));

  it('should be correct invoke hmrNgxsStoreBeforeOnDestroy', fakeAsync(async () => {
    let hmrRef: HmrManager<AppMockModule, any> | null = null;
    sessionStorage.setItem(NGXS_HMR_SNAPSHOT_KEY, JSON.stringify({ status: 'working' }));

    await hmr(module, bootstrap, {
      hmrAfterOnInit: (manager: HmrManager<AppMockModule, any>) => {
        hmrRef = manager;
        expect(hmrRef!.snapshot).toEqual({ status: 'working' });
        manager.beforeModuleOnDestroy();
      }
    });

    tick(1000);

    expect(hmrRef!.snapshot).toEqual({});
    expect(hmrRef!.store.snapshot()).toEqual({
      mock_state: { value: 'test' },
      status: 'working'
    });

    expect(hmrRef!.status.onInitIsCalled).toEqual(true);
    expect(hmrRef!.status.beforeOnDestroyIsCalled).toEqual(true);

    expect(AppMockModule.savedState).toEqual({
      mock_state: { value: 'test' },
      status: 'working'
    });
  }));
});
