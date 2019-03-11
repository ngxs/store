import { NgModuleRef } from '@angular/core';
import { HmrManager } from './hmr-manager';
import { BootstrapModuleFn, NgxsHmrOptions, WebpackModule } from './symbols';

export async function hmr<T>(
  module: WebpackModule,
  bootstrapFn: BootstrapModuleFn<T>,
  options: NgxsHmrOptions = {}
): Promise<NgModuleRef<T>> {
  if (!module.hot) {
    console.error('Are you using the --hmr flag for ng serve?');
    throw new Error('HMR is not enabled for webpack-dev-server!');
  }

  const manager = new HmrManager<T>(module, options);

  return await manager.hmrModule(bootstrapFn, () => {
    manager.beforeModuleBootstrap();

    module.hot.dispose(async () => {
      await manager.beforeModuleOnDestroy();
      await manager.createNewModule();
    });
  });
}
