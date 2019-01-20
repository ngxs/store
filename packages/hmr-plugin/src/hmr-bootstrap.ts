import {
  NgxsHmrLifeCycle,
  NgxsHmrOptions,
  NgxsHmrSnapshot,
  BootstrapModuleType,
  WebpackModule
} from './symbols';
import { HmrManager } from './hmr-manager';

export async function hmr<T extends NgxsHmrLifeCycle<S>, S = NgxsHmrSnapshot>(
  module: WebpackModule,
  bootstrap: BootstrapModuleType<T>,
  options: NgxsHmrOptions<T, S> = {}
) {
  const manager = new HmrManager<T, S>(module, options);

  module.hot.accept();

  return await manager.hmrModule(bootstrap, () => {
    manager.beforeModuleBootstrap();

    module.hot.dispose(() => {
      manager.beforeModuleOnDestroy();
      manager.createNewHosts();
    });
  });
}
