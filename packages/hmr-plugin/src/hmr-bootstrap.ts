import { NgModuleRef } from '@angular/core';
import { HmrManager } from './hmr-manager';
import { BootstrapModuleFn, NgxsHmrOptions, WebpackModule } from './symbols';
import { HmrStorage } from './internal/hmr-storage';

export async function hmr<T>(
  module: WebpackModule,
  bootstrapFn: BootstrapModuleFn<T>,
  options: NgxsHmrOptions = {}
): Promise<NgModuleRef<T>> {
  if (!module.hot) {
    console.error('Are you using the --hmr flag for ng serve?');
    throw new Error('HMR is not enabled for webpack-dev-server!');
  }

  module.hot.accept();

  type HmrDataTransfer = { snapshot: any };

  const dataTransfer: HmrDataTransfer = module.hot.data;
  const storage = new HmrStorage<any>();
  storage.snapshot = dataTransfer.snapshot || {};
  const manager = new HmrManager<T>(module, options, storage);

  return await manager.hmrModule(bootstrapFn, () => {
    manager.beforeModuleBootstrap();

    module.hot.dispose((data: HmrDataTransfer) => {
      data.snapshot = manager.beforeModuleOnDestroy();
      manager.createNewModule();
    });
  });
}
