import { NgModuleRef } from '@angular/core';
import { InternalStateOperations } from '@ngxs/store';

import { NGXS_HMR, NgxsStoreSnapshot, NgxsHmrLifeCycle } from './symbols';
import { StateOperations } from '@ngxs/store/src/internal/internals';

export function hmrDoBootstrap<T = NgxsStoreSnapshot>(ref: NgModuleRef<any>): NgModuleRef<any> {
  const ngxsHmrLifeCycle = <NgxsHmrLifeCycle<T>>ref.instance;
  const hmrNgxsStoreOnInitFn = ngxsHmrLifeCycle.hmrNgxsStoreOnInit;

  if (typeof hmrNgxsStoreOnInitFn === 'function') {
    const stateOperation = getStateOperations<T>(ref);
    if (stateOperation) {
      hmrNgxsStoreOnInitFn(stateOperation, getStateFromHmrStorage());
    }
    setStateInHmrStorage({});
  }

  return ref;
}

export function hmrDoDispose(ngModule: NgModuleRef<any>) {
  const snapshot: Partial<NgxsStoreSnapshot> = hmrBeforeOnDestroy<NgxsStoreSnapshot>(ngModule);
  setStateInHmrStorage(snapshot);
}

function hmrBeforeOnDestroy<T = NgxsStoreSnapshot>(ref: NgModuleRef<any>): Partial<T> {
  let resultSnapshot: Partial<T> = {};
  const ngxsHmrLifeCycle = <NgxsHmrLifeCycle<T>>ref.instance;
  const hmrNgxsStoreOnDestroyFn = ngxsHmrLifeCycle.hmrNgxsStoreBeforeOnDestroy;

  if (typeof hmrNgxsStoreOnDestroyFn === 'function') {
    const stateOperation = getStateOperations<T>(ref);
    if (stateOperation) {
      resultSnapshot = hmrNgxsStoreOnDestroyFn(stateOperation);
    }
  }

  return resultSnapshot;
}

function getStateOperations<T = any>(ref: NgModuleRef<any>): StateOperations<T> {
  const internalFactory: InternalStateOperations = ref.injector.get(InternalStateOperations, null);
  return internalFactory && internalFactory.getRootStateOperations();
}

/**
 * Session storage: max size - 5 MB, in future need usage IndexDB (50MB)
 * Session storage is used so that lazy modules can also be updated.
 */
export function hmrInit() {
  validateExistHmrStorage();
}

function validateExistHmrStorage() {
  const hmrStorageDoesNotExist = !(sessionStorage.getItem(NGXS_HMR.SNAPSHOT_KEY) || null);
  if (hmrStorageDoesNotExist) {
    sessionStorage.setItem(NGXS_HMR.SNAPSHOT_KEY, JSON.stringify({}));
  }
}

function getStateFromHmrStorage<T = NgxsStoreSnapshot>(): Partial<T> {
  return JSON.parse(sessionStorage.getItem(NGXS_HMR.SNAPSHOT_KEY) || '{}');
}

function setStateInHmrStorage<T = NgxsStoreSnapshot>(state: T): void {
  return sessionStorage.setItem(NGXS_HMR.SNAPSHOT_KEY, JSON.stringify(state));
}
