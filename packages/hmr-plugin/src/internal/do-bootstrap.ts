import { NgModuleRef } from '@angular/core';
import { StateContext } from '@ngxs/store';

import { setStateInHmrStorage } from './common';
import { stateEventLoop } from './state-event-loop';
import { HmrNgxsStoreOnInit, NgxsHmrLifeCycle, NgxsStoreSnapshot } from '../symbols';

export function hmrDoBootstrap<T extends NgxsHmrLifeCycle<S>, S = NgxsStoreSnapshot>(
  ref: NgModuleRef<T>
): NgModuleRef<T> {
  const ngxsHmrLifeCycle: NgxsHmrLifeCycle<S> = ref.instance;
  const hmrNgxsStoreOnInitFn: HmrNgxsStoreOnInit<S> = ngxsHmrLifeCycle.hmrNgxsStoreOnInit;

  if (typeof hmrNgxsStoreOnInitFn === 'function') {
    stateEventLoop<T, S>(ref, (state: Partial<S>, ctx: StateContext<S>) => {
      hmrNgxsStoreOnInitFn(ctx, state);
      setStateInHmrStorage({});
    });
  }

  return ref;
}
