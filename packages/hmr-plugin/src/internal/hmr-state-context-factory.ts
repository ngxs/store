import { Immutable, StateContext, Store } from '@ngxs/store';
import { isStateOperator } from '@ngxs/store/operators';
import { NgModuleRef } from '@angular/core';

export class HmrStateContextFactory<T, S> {
  public store: Store;

  constructor(module: NgModuleRef<T>) {
    const store = module.injector.get(Store, null);

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
      dispatch: actions => this.store!.dispatch(actions),
      getState: () => this.store!.snapshot() as Immutable<S>,
      setState: (val: Immutable<S>) => {
        if (isStateOperator(val)) {
          const currentState = this.store!.snapshot();
          val = val(currentState);
        }

        this.store!.reset(val);
        return val as Immutable<S>;
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
