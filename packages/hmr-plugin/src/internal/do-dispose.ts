import { NgModuleRef } from '@angular/core';

import { setStateInHmrStorage } from './common';
import { hmrBeforeOnDestroy } from './on-destroy';
import { NgxsHmrLifeCycle, NgxsStoreSnapshot } from '../symbols';

export function hmrDoDispose<T extends NgxsHmrLifeCycle<S>, S = NgxsStoreSnapshot>(
  ngModule: NgModuleRef<T>
) {
  const snapshot = hmrBeforeOnDestroy<T, S>(ngModule);
  setStateInHmrStorage(snapshot);
}
