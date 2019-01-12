import { StateContext, Store } from '@ngxs/store';
import { NgModuleRef } from '@angular/core';

import { isStateOperator } from './common';
import { NgxsHmrLifeCycle, NgxsStoreSnapshot } from '../symbols';

export function getStateContext<T extends NgxsHmrLifeCycle<S>, S = NgxsStoreSnapshot>(
  ref: NgModuleRef<T>
): StateContext<S> | undefined {
  const store: Store = ref.injector.get(Store, null);

  if (store) {
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
}
