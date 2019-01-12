import { ApplicationRef, NgModuleRef } from '@angular/core';
import { createNewHosts, hmrModule } from '@angularclass/hmr';

import { hmrInit } from './internal/init';
import { hmrDoDispose } from './internal/do-dispose';
import { hmrDoBootstrap } from './internal/do-bootstrap';
import { NgxsHmrLifeCycle, NgxsStoreSnapshot } from './symbols';

export function hmrNgxsBootstrap<T extends NgxsHmrLifeCycle<S>, S = NgxsStoreSnapshot>(
  module: any,
  bootstrap: () => Promise<NgModuleRef<T>>,
  autoClearLogs: boolean = true
) {
  let ngModule: NgModuleRef<T>;
  hmrInit();
  module.hot.accept();

  const promise = bootstrap().then((ref: NgModuleRef<T>) => {
    ngModule = hmrDoBootstrap<T, S>(ref);
    return hmrModule(ref, module);
  });

  module.hot.dispose(() => {
    if (!ngModule) {
      console.log('Angular application not bootstrapped! NGXS Hot Reloading skipped...');
      return;
    }
    if (autoClearLogs) {
      console.clear();
      console.log('[NGXS HMR] clear old logs...');
    }

    hmrDoDispose<T, S>(ngModule);

    const appRef: ApplicationRef = ngModule.injector.get(ApplicationRef);
    const elements = appRef.components.map(c => c.location.nativeElement);
    const removeOldHosts = createNewHosts(elements);
    removeOldHosts();
  });

  return promise;
}
