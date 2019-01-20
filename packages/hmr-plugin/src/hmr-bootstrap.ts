import { NgxsHmrLifeCycle, NgxsHmrOptions, NgxsHmrSnapshot } from './symbols';
import { HmrManager } from './hmr-manager';

export async function hmr<T extends NgxsHmrLifeCycle<S>, S = NgxsHmrSnapshot>(
  options: NgxsHmrOptions<T, S>
) {
  const { module, bootstrap } = options;
  const manager = new HmrManager<T, S>(options);

  module.hot.accept();

  return await manager.hmrModule(bootstrap, () => {
    manager.beforeModuleBootstrap();

    module.hot.dispose(() => {
      manager.beforeModuleOnDestroy();
      manager.createNewHosts();
    });
  });
}
