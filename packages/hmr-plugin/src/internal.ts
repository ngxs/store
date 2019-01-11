import { NgModuleRef } from '@angular/core';
import { StateContext, StateOperator, StateStream, Store } from '@ngxs/store';

import { NGXS_HMR_SNAPSHOT_KEY, NgxsHmrLifeCycle, NgxsStoreSnapshot } from './symbols';
import { Subscription } from 'rxjs';

export function hmrDoBootstrap<T extends NgxsHmrLifeCycle<S>, S = NgxsStoreSnapshot>(
  ref: NgModuleRef<T>
): NgModuleRef<T> {
  const ngxsHmrLifeCycle = ref.instance;
  const hmrNgxsStoreOnInitFn = ngxsHmrLifeCycle.hmrNgxsStoreOnInit;

  if (typeof hmrNgxsStoreOnInitFn === 'function') {
    const stateContext: StateContext<S> | undefined = getStateContext<T, S>(ref);
    if (stateContext) {
      const previousState: Partial<S> = getStateFromHmrStorage<S>();
      const existSavedState: boolean = Object.keys(previousState).length > 0;
      const stateStream: StateStream | null = getStateStream<T>(ref);

      if (existSavedState && stateStream) {
        let idEvent: number;
        const stateStreamId: Subscription = stateStream.subscribe(() => {
          clearInterval(idEvent);

          // Waiting until all events of the state manager are completed.
          idEvent = window.setTimeout(() => {
            // This is necessary to destroy all the logs
            // that go to the method call ngxsAfterBootstrap
            console.clear();

            hmrNgxsStoreOnInitFn(stateContext, previousState);
            setStateInHmrStorage({});

            stateStreamId.unsubscribe();
          }, 10);
        });
      }
    }
  }

  return ref;
}

export function hmrDoDispose<T extends NgxsHmrLifeCycle<S>, S = NgxsStoreSnapshot>(
  ngModule: NgModuleRef<T>
) {
  const snapshot = hmrBeforeOnDestroy<T, S>(ngModule);
  setStateInHmrStorage(snapshot);
}

function hmrBeforeOnDestroy<T extends NgxsHmrLifeCycle<S>, S = NgxsStoreSnapshot>(
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

// TODO: Add public api state context
function getStateContext<T extends NgxsHmrLifeCycle<S>, S = NgxsStoreSnapshot>(
  ref: NgModuleRef<T>
): StateContext<S> | undefined {
  const store: Store = ref.injector.get(Store, null);
  if (!store) {
    return undefined;
  }
  function isStateOperator(value: S | StateOperator<S>): value is StateOperator<S> {
    return typeof value === 'function';
  }

  return {
    dispatch(actions) {
      return store.dispatch(actions);
    },
    getState() {
      return <S>store.snapshot();
    },
    setState(val) {
      if (isStateOperator(val)) {
        const currentState = store.snapshot();
        val = val(currentState);
      }
      store.reset(val);
      return <S>val;
    },
    patchState(val) {
      const currentState = store.snapshot();
      const newState = { ...currentState, ...(<object>val) };
      store.reset(newState);
      return newState;
    }
  };
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

function getStateStream<T>(ref: NgModuleRef<T>): StateStream | null {
  return ref.injector.get(Store, null)['_stateStream'] || null;
}
