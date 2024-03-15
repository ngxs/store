import { Injectable } from '@angular/core';
import type { ReadonlyDeep } from 'type-fest';
import { Observable } from 'rxjs';

import { getValue, setValue } from '@ngxs/store/plugins';
import { ExistingState, StateOperator, isStateOperator } from '@ngxs/store/operators';

import { StateContext } from '../symbols';
import { MappedStore, StateOperations } from '../internal/internals';
import { InternalStateOperations } from '../internal/state-operations';
import { simplePatch } from './state-operators';

/**
 * State Context factory class
 * @ignore
 */
@Injectable({ providedIn: 'root' })
export class StateContextFactory {
  constructor(private _internalStateOperations: InternalStateOperations) {}

  /**
   * Create the state context
   */
  createStateContext<T>(mappedStore: MappedStore): StateContext<T> {
    const root = this._internalStateOperations.getRootStateOperations();

    return {
      getState(): ReadonlyDeep<T> {
        const currentAppState = root.getState();
        return getState(currentAppState, mappedStore.path);
      },
      patchState(val: Partial<T>): T {
        const currentAppState = root.getState();
        const patchOperator = simplePatch<T>(val);
        return setStateFromOperator(root, currentAppState, patchOperator, mappedStore.path);
      },
      setState(val: T | StateOperator<T>): T {
        const currentAppState = root.getState();
        return isStateOperator(val)
          ? setStateFromOperator(root, currentAppState, val, mappedStore.path)
          : setStateValue(root, currentAppState, val, mappedStore.path);
      },
      dispatch(actions: any | any[]): Observable<void> {
        return root.dispatch(actions);
      }
    };
  }
}

function setStateValue<T>(
  root: StateOperations<any>,
  currentAppState: any,
  newValue: T,
  path: string
): any {
  const newAppState = setValue(currentAppState, path, newValue);
  root.setState(newAppState);
  return newAppState;
  // In doing this refactoring I noticed that there is a 'bug' where the
  // application state is returned instead of this state slice.
  // This has worked this way since the beginning see:
  // https://github.com/ngxs/store/blame/324c667b4b7debd8eb979006c67ca0ae347d88cd/src/state-factory.ts
  // This needs to be fixed, but is a 'breaking' change.
  // I will do this fix in a subsequent PR and we can decide how to handle it.
}

function setStateFromOperator<T>(
  root: StateOperations<any>,
  currentAppState: any,
  stateOperator: StateOperator<T>,
  path: string
) {
  const local = getState(currentAppState, path);
  const newValue = stateOperator(local as ExistingState<T>);
  return setStateValue(root, currentAppState, newValue, path);
}

function getState<T>(currentAppState: any, path: string): T {
  return getValue(currentAppState, path);
}
