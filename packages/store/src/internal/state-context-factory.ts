import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { StateContext, StateOperator } from '../symbols';
import { MappedStore } from '../internal/internals';
import { setValue, getValue } from '../utils/utils';
import { InternalStateOperations } from '../internal/state-operations';
import { set, simplePatch } from './state-operators';

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

    return {
      getState(): T {
        const state = root.getState();
        return getValue(state, metadata.depth);
      },
      patchState(val: Partial<T>): T {
        const patchOperator = simplePatch(<T>val);

        const state = root.getState();
        const local = getValue(state, metadata.depth);
        const clone = patchOperator(local);

        const newState = setValue(state, metadata.depth, clone);
        root.setState(newState);
        return newState;
      },
      setState(val: T | StateOperator<T>): T {
        const isFunction = typeof val === 'function';
        const stateOperator = isFunction ? <StateOperator<T>>val : set(<T>val);

        const state = root.getState();
        const local = getValue(state, metadata.depth);
        const newValue = stateOperator(local);

        const newState = setValue(state, metadata.depth, newValue);
        root.setState(newState);
        return state;
      },
      dispatch(actions: any | any[]): Observable<void> {
        return root.dispatch(actions);
      }
    };
  }
}
