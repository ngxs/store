import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { StateContext, StateOperator } from '../symbols';
import { MappedStore } from '../internal/internals';
import { setValue, getValue } from '../utils/utils';
import { InternalStateOperations } from '../internal/state-operations';
import { simplePatch } from './state-operators';

/**
 * State Context factory class
 * @ignore
 */
@Injectable()
export class StateContextFactory {
  constructor(private _internalStateOperations: InternalStateOperations) {}

  /**
   * Create the state context
   */
  createStateContext<T>(metadata: MappedStore): StateContext<T> {
    const root = this._internalStateOperations.getRootStateOperations();

    function getState(): T {
      const state = root.getState();
      return getValue(state, metadata.depth);
    }

    function setStateValue(newValue: T): any {
      const state = root.getState();
      const newState = setValue(state, metadata.depth, newValue);
      root.setState(newState);
      return newState;
      // In doing this refactoring I noticed that there is a 'bug' where the
      // application state is returned instead of this state slice.
      // This has worked this way since the beginning see:
      // https://github.com/ngxs/store/blame/324c667b4b7debd8eb979006c67ca0ae347d88cd/src/state-factory.ts
      // This needs to be fixed, but is a 'breaking' change.
      // I will do this fix in a subsequent PR and we can decide how to handle
    }

    return {
      getState,
      patchState(val: Partial<T>): T {
        const patchOperator = simplePatch<T>(val);

        const local = getState();
        const clone = patchOperator(local);

        return setStateValue(clone);
      },
      setState(val: T | StateOperator<T>): T {
        const isFunction = typeof val === 'function';

        if (isFunction) {
          const stateOperator = <StateOperator<T>>val;
          const local = getState();
          const newValue = stateOperator(local);
          return setStateValue(newValue);
        } else {
          return setStateValue(<T>val);
        }
      },
      dispatch(actions: any | any[]): Observable<void> {
        return root.dispatch(actions);
      }
    };
  }
}
