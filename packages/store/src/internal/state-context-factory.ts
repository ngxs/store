import { EnvironmentInjector, ErrorHandler, inject, Injectable } from '@angular/core';
import { getValue, setValue } from '@ngxs/store/plugins';
import { ExistingState, StateOperator, isStateOperator } from '@ngxs/store/operators';
import type { Observable } from 'rxjs';

import { StateContext } from '../symbols';
import { StateOperations } from '../internal/internals';
import { InternalStateOperations } from '../internal/state-operations';
import { simplePatch } from './state-operators';

export class StateContextDestroyedError extends Error {
  override readonly name = 'StateContextDestroyedError';

  constructor(readonly path: string) {
    super(
      typeof ngDevMode !== 'undefined' && ngDevMode
        ? `Attempted to interact with state after the injector has been destroyed. State path: "${path}". ` +
            `This can happen in server-side rendering when the app is destroyed before all async operations complete, ` +
            `e.g. inside a finalize() operator that runs after the injector has been destroyed.`
        : ''
    );

    Object.setPrototypeOf(this, StateContextDestroyedError.prototype);
  }
}

/**
 * State Context factory class
 * @ignore
 */
@Injectable({ providedIn: 'root' })
export class StateContextFactory {
  private _injector = inject(EnvironmentInjector);
  private _internalStateOperations = inject(InternalStateOperations);
  private _errorHandler = inject(ErrorHandler);

  /**
   * Create the state context
   */
  createStateContext<T>(path: string, abortSignal: AbortSignal): StateContext<T> {
    const injector = this._injector;
    const errorHandler = this._errorHandler;
    const root = this._internalStateOperations.getRootStateOperations();

    return {
      abortSignal,
      getState(): T {
        if (injector.destroyed) {
          // Only report — do not return early. Returning `undefined as T` would
          // be a breaking change for callers that assume getState() always
          // returns a value. handleError is just for observability (e.g. Rollbar);
          // the state data is still readable even after the injector is gone.
          errorHandler.handleError(new StateContextDestroyedError(path));
        }
        const currentAppState = root.getState();
        return getState(currentAppState, path);
      },
      patchState(value: Partial<T>): void {
        // If the injector has been destroyed (e.g. app destroyed mid-action),
        // skip the state update to avoid writing to completed subjects.
        if (injector.destroyed) {
          errorHandler.handleError(new StateContextDestroyedError(path));
          return;
        }
        const currentAppState = root.getState();
        const patchOperator = simplePatch<T>(value);
        setStateFromOperator(root, currentAppState, patchOperator, path);
      },
      setState(value: T | StateOperator<T>): void {
        // Same guard as patchState — no-op if the injector is already destroyed.
        if (injector.destroyed) {
          errorHandler.handleError(new StateContextDestroyedError(path));
          return;
        }
        const currentAppState = root.getState();
        if (isStateOperator(value)) {
          setStateFromOperator(root, currentAppState, value, path);
        } else {
          setStateValue(root, currentAppState, value, path);
        }
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
