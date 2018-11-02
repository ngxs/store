import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { StateContext, PatchFunction } from '../symbols';
import { MappedStore } from '../internal/internals';
import { setValue, getValue } from '../utils/utils';
import { InternalStateOperations } from '../internal/state-operations';

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
      patchState(val: Partial<T> | PatchFunction<T>): T {
        const isFunction = typeof val === 'function';
        const patchOperation = isFunction ? <PatchFunction<T>>val : simplePatch<T>(<Partial<T>>val);

        const state = root.getState();
        const local = getValue(state, metadata.depth);
        const clone = patchOperation(local);

        const newState = setValue(state, metadata.depth, clone);
        root.setState(newState);
        return newState;
      },
      setState(val: T): T {
        let state = root.getState();
        state = setValue(state, metadata.depth, val);
        root.setState(state);
        return state;
      },
      dispatch(actions: any | any[]): Observable<void> {
        return root.dispatch(actions);
      }
    };
  }
}

function simplePatch<T>(val: Partial<T>): PatchFunction<T> {
  return (existingState: Readonly<T>) => {
    const isArray = Array.isArray(val);
    const isPrimitive = typeof val !== 'object';
    if (isArray) {
      throw new Error('Patching arrays is not supported.');
    }
    if (isPrimitive) {
      throw new Error('Patching primitives is not supported.');
    }
    const newState = { ...(<any>existingState) };
    for (const k in val) {
      newState[k] = val[k];
    }
    return <T>newState;
  };
}
