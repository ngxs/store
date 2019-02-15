import {
  NgxsHmrLifeCycle,
  NgxsHmrOptions,
  NgxsHmrSnapshot,
  BootstrapModuleType,
  WebpackModule
} from './symbols';
import { HmrManager } from './hmr-manager';
import { NgModuleRef } from '@angular/core';

export async function hmr<T extends Partial<NgxsHmrLifeCycle<S>>, S = NgxsHmrSnapshot>(
  module: WebpackModule,
  bootstrap: BootstrapModuleType<T>,
  options: NgxsHmrOptions = {}
): Promise<NgModuleRef<T>> {
  const manager = new HmrManager<T, S>(module, options);

  module.hot.accept();

  return await manager.hmrModule(bootstrap, () => {
    manager.beforeModuleBootstrap();

    module.hot.dispose(async () => {
      await manager.beforeModuleOnDestroy();
      await manager.createNewModule();
    });
  });
}
