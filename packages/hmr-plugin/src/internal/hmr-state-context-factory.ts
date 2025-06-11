import { StateContext, Store } from '@ngxs/store';
import { isStateOperator } from '@ngxs/store/operators';
import { NgModuleRef } from '@angular/core';

export class HmrStateContextFactory<T, S> {
  public store: Store;

  constructor(module: NgModuleRef<T>) {
    const store = module.injector.get<Store>(Store, undefined);

    if (!store) {
      throw new Error('Store not found, maybe you forgot to import the NgxsModule');
    }

    this.store = store;
  }

  /**
   * @description
   * must be taken out into  @ngxs/store/internals
   */
  public createStateContext(): StateContext<S> {
    return {
      abortController: new AbortController(),
      dispatch: actions => this.store!.dispatch(actions),
      getState: () => <S>this.store!.snapshot(),
      setState: val => {
        if (isStateOperator(val)) {
          const currentState = this.store!.snapshot();
          val = val(currentState);
        }

        this.store!.reset(val);
        return <S>val;
      },
      patchState: val => {
        const currentState = this.store!.snapshot();
        const newState = { ...currentState, ...(<object>val) };
        this.store!.reset(newState);
        return newState;
      }
    };
  }
}
