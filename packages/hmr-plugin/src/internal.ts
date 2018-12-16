import { NgModuleRef } from '@angular/core';
import { InternalStateOperations } from '@ngxs/store';

import { HmrNgxsStoreOnDestroyFn, HmrNgxsStoreOnInitFn, NGXS_HMR, NgxsStoreSnapshot } from './symbols';
import { StateOperations } from '@ngxs/store/src/internal/internals';

export function hmrDoBootstrap<T = NgxsStoreSnapshot>(ref: NgModuleRef<any>): NgModuleRef<any> {
  const hmrNgxsStoreOnInitFn: HmrNgxsStoreOnInitFn<T> = ref.instance[NGXS_HMR.hmrNgxsStoreOnInit];

  if (typeof hmrNgxsStoreOnInitFn === 'function') {
    const stateOperation: StateOperations<NgxsStoreSnapshot> = getStateOperations(ref);
    stateOperation && hmrNgxsStoreOnInitFn(getStateOperations(ref), getStateFromHmrStorage());
    setStateInHmrStorage({});
  }

  return ref;
}

export function hmrBeforeOnDestroy<T = NgxsStoreSnapshot>(ref: NgModuleRef<any>): Partial<T> {
  let resultSnapshot: Partial<T> = {};
  const hmrNgxsStoreOnDestroyFn: HmrNgxsStoreOnDestroyFn<T> = ref.instance[NGXS_HMR.hmrNgxsStoreBeforeOnDestroy];

  if (typeof hmrNgxsStoreOnDestroyFn === 'function') {
    const stateOperation: StateOperations<NgxsStoreSnapshot> = getStateOperations(ref);
    resultSnapshot = (stateOperation && hmrNgxsStoreOnDestroyFn(getStateOperations(ref))) || resultSnapshot;
  }

  return resultSnapshot;
}

export function getStateOperations<T = any>(ref: NgModuleRef<any>): StateOperations<T> {
  const internalFactory: InternalStateOperations = ref.injector.get(InternalStateOperations, null);
  return internalFactory && internalFactory.getRootStateOperations();
}

/**
 * Session storage: max size - 5 MB, in future need usage IndexDB (50MB)
 * Session storage is used so that lazy modules can also be updated.
 */
export function validateExistHmrStorage() {
  const hmrStorageDoesNotExist = !(sessionStorage.getItem(NGXS_HMR.SNAPSHOT_KEY) || null);
  hmrStorageDoesNotExist && sessionStorage.setItem(NGXS_HMR.SNAPSHOT_KEY, JSON.stringify({}));
}

export function getStateFromHmrStorage<T = NgxsStoreSnapshot>(): Partial<T> {
  return JSON.parse(sessionStorage.getItem(NGXS_HMR.SNAPSHOT_KEY) || '{}');
}

export function setStateInHmrStorage<T = NgxsStoreSnapshot>(state: T): void {
  return sessionStorage.setItem(NGXS_HMR.SNAPSHOT_KEY, JSON.stringify(state));
}
