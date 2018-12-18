import { NgModuleRef } from '@angular/core';
import { Store, StateContext, StateOperator } from '@ngxs/store';

import { NGXS_HMR_SNAPSHOT_KEY, NgxsStoreSnapshot, NgxsHmrLifeCycle } from './symbols';

export function hmrDoBootstrap<T extends NgxsHmrLifeCycle<S>, S = NgxsStoreSnapshot>(
  ref: NgModuleRef<T>
): NgModuleRef<T> {
  const ngxsHmrLifeCycle = ref.instance;
  const hmrNgxsStoreOnInitFn = ngxsHmrLifeCycle.hmrNgxsStoreOnInit;

  if (typeof hmrNgxsStoreOnInitFn === 'function') {
    const stateContext = getStateContext<S>(ref);
    if (stateContext) {
      hmrNgxsStoreOnInitFn(stateContext, getStateFromHmrStorage());
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
    const stateContext = getStateContext<S>(ref);
    if (stateContext) {
      resultSnapshot = hmrNgxsStoreOnDestroyFn(stateContext);
    }
  }

  return resultSnapshot;
}

function getStateContext<S = any>(ref: NgModuleRef<any>): StateContext<S> | undefined {
  const store: Store = ref.injector.get(Store, null);
  if (!store) {
    return undefined;
  }
  function isStateOperator(value: S | StateOperator<S>): value is StateOperator<S> {
    return typeof value === 'function';
  }

  const stateContext: StateContext<S> = {
    dispatch(actions) {
      return store.dispatch(actions);
    },
    getState() {
      return store.snapshot();
    },
    setState(val) {
      if (isStateOperator(val)) {
        const currentState = store.snapshot();
        val = val(currentState);
      }
      return store.reset(val);
    },
    patchState(val) {
      const currentState = store.snapshot();
      return store.reset({ ...currentState, ...val });
    }
  };
  return stateContext;
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
