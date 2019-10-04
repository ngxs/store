import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { MappedStore } from '../internal/internals';
import { setValue, getValue } from '../utils/utils';
import { NgxsConfig, StateContext, StateOperator } from '../symbols';
import { InternalStateOperations } from '../internal/state-operations';
import { simplePatch } from './state-operators';

/**
 * State Context factory class
 * @ignore
 */
@Injectable()
export class StateContextFactory {
  constructor(
    private _internalStateOperations: InternalStateOperations,
    private _config: NgxsConfig
  ) {}

  /**
   * Create the state context
   */
  createStateContext<T>(metadata: MappedStore): StateContext<T> {
    const root = this._internalStateOperations.getRootStateOperations();
    const config: NgxsConfig = this._config;

    function getState(currentAppState: any): T {
      return getValue(currentAppState, metadata.depth);
    }

    function setStateValue(currentAppState: any, newValue: T): any {
      const newAppState = setValue(currentAppState, metadata.depth, newValue);
      root.setState(newAppState);
      return config.compatibility.implicitReturnState === 'legacy_disabled'
        ? getState(newAppState)
        : newAppState;
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
