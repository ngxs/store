import { NgxsHmrOptions, BootstrapModuleFn, WebpackModule } from './symbols';
import { HmrManager } from './hmr-manager';
import { NgModuleRef } from '@angular/core';

export async function hmr<T>(
  module: WebpackModule,
  bootstrapFn: BootstrapModuleFn<T>,
  options: NgxsHmrOptions = {}
): Promise<NgModuleRef<T>> {
  const manager = new HmrManager<T>(module, options);

  module.hot.accept();

  return await manager.hmrModule(bootstrapFn, () => {
    manager.beforeModuleBootstrap();

    module.hot.dispose(async () => {
      await manager.beforeModuleOnDestroy();
      await manager.createNewModule();
    });
  });
}
