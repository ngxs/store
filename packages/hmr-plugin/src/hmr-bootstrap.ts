import { NgModuleRef } from '@angular/core';
import { HmrManager } from './hmr-manager';
import { BootstrapModuleFn, NgxsHmrOptions, WebpackModule } from './symbols';
import { HmrStorage } from './internal/hmr-storage';
import { markApplicationAsHmrReloaded, setHmrReloadedTo } from './utils/internals';

export async function hmr<T>(
  webpackModule: WebpackModule,
  bootstrapFn: BootstrapModuleFn<T>,
  options: NgxsHmrOptions = {}
): Promise<NgModuleRef<T>> {
  if (!webpackModule.hot) {
    console.error('Are you using the --hmr flag for ng serve?');
    throw new Error('HMR is not enabled for webpack-dev-server!');
  }

  markApplicationAsHmrReloaded();

  webpackModule.hot.accept();

  interface HmrDataTransfer {
    snapshot?: any;
  }
  const dataTransfer: HmrDataTransfer = webpackModule.hot.data || {};

  const storage = new HmrStorage<any>(dataTransfer.snapshot || {});
  const manager = new HmrManager<T>(options, storage);

  return await manager.hmrModule(bootstrapFn, () => {
    manager.beforeModuleBootstrap();

    webpackModule.hot!.dispose((data: HmrDataTransfer) => {
      setHmrReloadedTo(true);
      data.snapshot = manager.beforeModuleOnDestroy();
      manager.createNewModule();
    });
  });
}
