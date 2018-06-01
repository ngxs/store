import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { StateContext } from './symbols';
import { MappedStore } from './internals';
import { setValue, getValue } from './utils';
import { InternalStateOperations } from './state-operations';

/**
 * State Context factory class
 * @ignore
 */
@Injectable()
export class StateContextFactory {
  constructor(
    private _internalStateOperations: InternalStateOperations
  ) {}

  /**
   * Create the state context
   */
  createStateContext(metadata: MappedStore): StateContext<any> {
    const root = this._internalStateOperations.getRootStateOperations();
    return {
      getState(): any {
        const state = root.getState();
        return getValue(state, metadata.depth);
      },
      patchState(val: any): any {
        const isArray = Array.isArray(val);
        const isPrimitive = typeof val !== 'object';

        if (isArray) {
          throw new Error('Patching arrays is not supported.');
        } else if (isPrimitive) {
          throw new Error('Patching primitives is not supported.');
        }

        const state = root.getState();
        const local = getValue(state, metadata.depth);
        const clone = { ...local };

        for (const k in val) {
          clone[k] = val[k];
        }

        const newState = setValue(state, metadata.depth, clone);
        root.setState(newState);
        return newState;
      },
      setState(val: any): any {
        let state = root.getState();
        state = setValue(state, metadata.depth, val);
        root.setState(state);
        return state;
      },
      dispatch(actions: any | any[]): Observable<any> {
        return root.dispatch(actions);
      }
    };
  }
}
