import { ApplicationRef, NgModuleRef } from '@angular/core';
import { createNewHosts } from '@angularclass/hmr';

import { hmrInit, hmrDoBootstrap, hmrDoDispose } from './internal';
import { NgxsHmrLifeCycle, NgxsStoreSnapshot } from './symbols';

export function hmrNgxsBootstrap<T extends NgxsHmrLifeCycle<S>, S = NgxsStoreSnapshot>(
  module: any,
  bootstrap: () => Promise<NgModuleRef<T>>,
  autoClearLogs: boolean = true
) {
  let ngModule: NgModuleRef<T>;
  hmrInit();
  module.hot.accept();

  const promise = bootstrap().then((ref: NgModuleRef<T>) => (ngModule = hmrDoBootstrap<T, S>(ref)));

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
