import { NgModuleRef } from '@angular/core';
import { Bootstrapper, StateStream, Store } from '@ngxs/store';

import { NGXS_HMR_SNAPSHOT_KEY, NgxsStoreSnapshot } from '../symbols';

export function validateExistHmrStorage() {
  const hmrStorageDoesNotExist = !(sessionStorage.getItem(NGXS_HMR_SNAPSHOT_KEY) || null);
  if (hmrStorageDoesNotExist) {
    sessionStorage.setItem(NGXS_HMR_SNAPSHOT_KEY, '{}');
  }
}

export function getStateFromHmrStorage<S = NgxsStoreSnapshot>(): Partial<S> {
  return JSON.parse(sessionStorage.getItem(NGXS_HMR_SNAPSHOT_KEY) || '{}');
}

export function setStateInHmrStorage<S = NgxsStoreSnapshot>(state: S): void {
  return sessionStorage.setItem(NGXS_HMR_SNAPSHOT_KEY, JSON.stringify(state));
}

export function getStateStream<T>(ref: NgModuleRef<T>): StateStream | null {
  return ref.injector.get(Store, null)['_stateStream'] || null;
}

export function getBootstrap<T>(ref: NgModuleRef<T>): Bootstrapper | null {
  return ref.injector.get(Bootstrapper, null) || null;
}
