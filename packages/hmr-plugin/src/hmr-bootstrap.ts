import { ApplicationRef, NgModuleRef } from '@angular/core';
import { createNewHosts } from '@angularclass/hmr';
import { StateStream } from '@ngxs/store';

export enum NGXS_HMR {
  SNAPSHOT_KEY = '__NGXS_HMR_SNAPSHOT__'
}

(window as any)[NGXS_HMR.SNAPSHOT_KEY] = {};

export const hmrNgxsBootstrap = (module: any, bootstrap: () => Promise<NgModuleRef<any>>) => {
  let ngModule: NgModuleRef<any>;
  module.hot.accept();

  bootstrap().then((ref: NgModuleRef<any>) => {
    ngModule = ref;
    hmrNgxsStoreOnInit(ngModule);
  });

  module.hot.dispose(() => {
    console.clear();
    console.log('NGXS HMR enabled');

    const snapshot = hmrNgxsStoreOnDestroy(ngModule);
    (window as any)[NGXS_HMR.SNAPSHOT_KEY] = JSON.parse(JSON.stringify(snapshot));

    const appRef: ApplicationRef = ngModule.injector.get(ApplicationRef);
    const elements = appRef.components.map(c => c.location.nativeElement);
    const removeOldHosts = createNewHosts(elements);
    removeOldHosts();
  });
};

function hmrNgxsStoreOnInit(ref: NgModuleRef<any>) {
  const hmrNgxsStoreOnInitFn = ref.instance['hmrNgxsStoreOnInit'];
  if (typeof hmrNgxsStoreOnInitFn === 'function') {
    const currentStateStream: StateStream = getStateStream(ref);
    const currentSnapshot = (window as any)[NGXS_HMR.SNAPSHOT_KEY];
    hmrNgxsStoreOnInitFn(currentStateStream, currentSnapshot);
  }
}

function hmrNgxsStoreOnDestroy(ref: NgModuleRef<any>) {
  let resultSnapshot = {};
  const hmrNgxsStoreOnDestroyFn = ref.instance['hmrNgxsStoreOnDestroy'];
  if (typeof hmrNgxsStoreOnDestroyFn === 'function') {
    const currentStateStream: StateStream = getStateStream(ref);
    resultSnapshot = hmrNgxsStoreOnDestroyFn(currentStateStream) || null;
  }

  return resultSnapshot;
}

function getStateStream(ref: NgModuleRef<any>): StateStream {
  const providers: any[] = (ref as any)._providers;
  const store: any = providers.find((provider: any) => {
    const providerIsObject = provider instanceof Object;
    return providerIsObject && provider.constructor.name === 'Store';
  });

  return store._stateStream;
}
