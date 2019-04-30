import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Immutable, StateContext, StateOperator } from '../symbols';
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

    function getState(currentAppState: any): Immutable<T> {
      return getValue(currentAppState, metadata.depth);
    }

    function setStateValue(currentAppState: any, newValue: Immutable<T>): any {
      const newAppState = setValue(currentAppState, metadata.depth, newValue);
      root.setState(newAppState);
      return newAppState;
      // In doing this refactoring I noticed that there is a 'bug' where the
      // application state is returned instead of this state slice.
      // This has worked this way since the beginning see:
      // https://github.com/ngxs/store/blame/324c667b4b7debd8eb979006c67ca0ae347d88cd/src/state-factory.ts
      // This needs to be fixed, but is a 'breaking' change.
      // I will do this fix in a subsequent PR and we can decide how to handle it.
    }

    function setStateFromOperator(
      currentAppState: any,
      stateOperator: StateOperator<Immutable<T>>
    ) {
      const local = getState(currentAppState);
      const newValue = stateOperator(local);
      return setStateValue(currentAppState, newValue);
    }

    function isStateOperator(
      value: Immutable<T> | StateOperator<Immutable<T>>
    ): value is StateOperator<Immutable<T>> {
      return typeof value === 'function';
    }

    return {
      getState(): Immutable<T> {
        const currentAppState = root.getState();
        return getState(currentAppState) as Immutable<T>;
      },
      patchState(val: Partial<Immutable<T>>): Immutable<T> {
        const currentAppState = root.getState();
        const patchOperator = simplePatch<Immutable<T>>(val);
        return setStateFromOperator(currentAppState, patchOperator);
      },
      setState(val: Immutable<T> | StateOperator<Immutable<T>>): Immutable<T> {
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
