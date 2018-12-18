import { NgModuleRef } from '@angular/core';
import { InternalStateOperations } from '@ngxs/store';

import { NGXS_HMR_SNAPSHOT_KEY, NgxsStoreSnapshot, NgxsHmrLifeCycle } from './symbols';
import { StateOperations } from '@ngxs/store/src/internal/internals';

export function hmrDoBootstrap<T extends NgxsHmrLifeCycle<S>, S = NgxsStoreSnapshot>(
  ref: NgModuleRef<T>
): NgModuleRef<T> {
  const ngxsHmrLifeCycle = ref.instance;
  const hmrNgxsStoreOnInitFn = ngxsHmrLifeCycle.hmrNgxsStoreOnInit;

  if (typeof hmrNgxsStoreOnInitFn === 'function') {
    const stateOperation = getStateOperations<S>(ref);
    if (stateOperation) {
      hmrNgxsStoreOnInitFn(stateOperation, getStateFromHmrStorage());
    }
    setStateInHmrStorage({});
  }

  return ref;
}

export function hmrDoDispose<T extends NgxsHmrLifeCycle<S>, S = NgxsStoreSnapshot>(ngModule: NgModuleRef<T>) {
  const snapshot = hmrBeforeOnDestroy(ngModule);
  setStateInHmrStorage(snapshot);
}

function hmrBeforeOnDestroy<T extends NgxsHmrLifeCycle<S>, S = NgxsStoreSnapshot>(ref: NgModuleRef<T>): Partial<S> {
  let resultSnapshot: Partial<S> = {};
  const ngxsHmrLifeCycle = ref.instance;
  const hmrNgxsStoreOnDestroyFn = ngxsHmrLifeCycle.hmrNgxsStoreBeforeOnDestroy;

  if (typeof hmrNgxsStoreOnDestroyFn === 'function') {
    const stateOperation = getStateOperations<S>(ref);
    if (stateOperation) {
      resultSnapshot = hmrNgxsStoreOnDestroyFn(stateOperation);
    }
  }

  return resultSnapshot;
}

function getStateOperations<S = any>(ref: NgModuleRef<any>): StateOperations<S> {
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
  const hmrStorageDoesNotExist = !(sessionStorage.getItem(NGXS_HMR_SNAPSHOT_KEY) || null);
  if (hmrStorageDoesNotExist) {
    sessionStorage.setItem(NGXS_HMR_SNAPSHOT_KEY, JSON.stringify({}));
  }
}

function getStateFromHmrStorage<S = NgxsStoreSnapshot>(): Partial<S> {
  return JSON.parse(sessionStorage.getItem(NGXS_HMR_SNAPSHOT_KEY) || '{}');
}

function setStateInHmrStorage<S = NgxsStoreSnapshot>(state: S): void {
  return sessionStorage.setItem(NGXS_HMR_SNAPSHOT_KEY, JSON.stringify(state));
}
