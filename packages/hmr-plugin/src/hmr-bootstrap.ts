import { ApplicationRef, NgModuleRef } from '@angular/core';
import { createNewHosts } from '@angularclass/hmr';

import { hmrBeforeOnDestroy, hmrDoBootstrap, setStateInHmrStorage, validateExistHmrStorage } from './internal';
import { HmrBootstrapFn, NgxsStoreSnapshot } from './symbols';

export const hmrNgxsBootstrap: HmrBootstrapFn = (module, bootstrap, autoClearLogs = true) => {
  let ngModule: NgModuleRef<any>;
  validateExistHmrStorage();
  module.hot.accept();

  bootstrap().then((ref: NgModuleRef<any>) => (ngModule = hmrDoBootstrap(ref)));

  module.hot.dispose(() => {
    if (autoClearLogs) {
      console.clear();
      console.log('[NGXS HMR] clear old logs...');
    }

    const snapshot: Partial<NgxsStoreSnapshot> = hmrBeforeOnDestroy<NgxsStoreSnapshot>(ngModule);
    setStateInHmrStorage(snapshot);

    const appRef: ApplicationRef = ngModule.injector.get(ApplicationRef);
    const elements = appRef.components.map(c => c.location.nativeElement);
    const removeOldHosts = createNewHosts(elements);
    removeOldHosts();
  });
};
