import { NgModuleRef } from '@angular/core';

import { getStateContext } from './state-context';
import { NgxsHmrLifeCycle, NgxsStoreSnapshot } from '../symbols';

export function hmrBeforeOnDestroy<T extends NgxsHmrLifeCycle<S>, S = NgxsStoreSnapshot>(
  ref: NgModuleRef<T>
): Partial<S> {
  let resultSnapshot: Partial<S> = {};
  const ngxsHmrLifeCycle = ref.instance;
  const hmrNgxsStoreOnDestroyFn = ngxsHmrLifeCycle.hmrNgxsStoreBeforeOnDestroy;

  if (typeof hmrNgxsStoreOnDestroyFn === 'function') {
    const stateContext = getStateContext<T, S>(ref);
    if (stateContext) {
      resultSnapshot = hmrNgxsStoreOnDestroyFn(stateContext);
    }
  }

  return resultSnapshot;
}
