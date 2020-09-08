import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { NgxsLifeCycle, NgxsSimpleChange, StateContext, StateOperator } from '../symbols';
import { getStateDiffChanges, MappedStore } from '../internal/internals';
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
  createStateContext<T>(mappedStore: MappedStore): StateContext<T> {
    const root = this._internalStateOperations.getRootStateOperations();

    function getState(currentAppState: any): T {
      return getValue(currentAppState, mappedStore.path);
    }

    function setStateValue(currentAppState: any, newValue: T): any {
      const newAppState = setValue(currentAppState, mappedStore.path, newValue);
      const instance: NgxsLifeCycle = mappedStore.instance;

      if (instance.ngxsOnChanges) {
        const change: NgxsSimpleChange = getStateDiffChanges<T>(mappedStore, {
          currentAppState,
          newAppState
        });

        instance.ngxsOnChanges(change);
      }

      root.setState(newAppState);
      return newAppState;
      // In doing this refactoring I noticed that there is a 'bug' where the
      // application state is returned instead of this state slice.
      // This has worked this way since the beginning see:
      // https://github.com/ngxs/store/blame/324c667b4b7debd8eb979006c67ca0ae347d88cd/src/state-factory.ts
      // This needs to be fixed, but is a 'breaking' change.
      // I will do this fix in a subsequent PR and we can decide how to handle it.
    }

    function setStateFromOperator(currentAppState: any, stateOperator: StateOperator<T>) {
      const local = getState(currentAppState);
      const newValue = stateOperator(local);
      return setStateValue(currentAppState, newValue);
    }

    function isStateOperator(value: T | StateOperator<T>): value is StateOperator<T> {
      return typeof value === 'function';
    }

    return {
      getState(): T {
        const currentAppState = root.getState();
        return getState(currentAppState);
      },
      patchState(val: Partial<T>): T {
        const currentAppState = root.getState();
        const patchOperator = simplePatch<T>(val);
        return setStateFromOperator(currentAppState, patchOperator);
      },
      setState(val: T | StateOperator<T>): T {
        const currentAppState = root.getState();
        return isStateOperator(val)
          ? setStateFromOperator(currentAppState, val)
          : setStateValue(currentAppState, val);
      },
      dispatch(actions: any | any[]): Observable<void> {
        return root.dispatch(actions);
      }
    };
  }
}
