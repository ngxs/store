import { StateContext, StateOperator, Store } from '@ngxs/store';
import { NgModuleRef } from '@angular/core';

import { NgxsHmrLifeCycle, NgxsStoreSnapshot } from '../symbols';

// TODO: add public API into @ngxs/store
export function getStateContext<T extends NgxsHmrLifeCycle<S>, S = NgxsStoreSnapshot>(
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
