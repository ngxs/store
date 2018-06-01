import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { StateContext } from './symbols';
import { InternalStateOperations, MappedStore } from './internals';
import { setValue, getValue } from './utils';
import { InternalDispatcher } from './dispatcher';
import { StateStream } from './state-stream';

/**
 * State Context factory class
 * @ignore
 */
@Injectable()
export class StateContextFactory {
  constructor(private _stateStream: StateStream, private _dispatcher: InternalDispatcher) {}

  private get rootStateOperations(): InternalStateOperations<any> {
    return {
      getState: () => this._stateStream.getValue(),
      setState: newState => this._stateStream.next(newState),
      dispatch: actions => this._dispatcher.dispatch(actions)
    };
  }

  /**
   * Create the state context
   */
  createStateContext(metadata: MappedStore): StateContext<any> {
    const root = this.rootStateOperations;
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
        const state = root.getState();
        const newState = setValue(state, metadata.depth, val);
        root.setState(newState);
        return state;
      },
      dispatch(actions: any | any[]): Observable<any> {
        return root.dispatch(actions);
      }
    };
  }
}
