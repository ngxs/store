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
        : path
    );

    Object.setPrototypeOf(this, StateContextDestroyedError.prototype);
  }
}

/**
 * Creates `StateContext` instances scoped to a specific state path.
 * Each action handler receives one of these contexts so it can read and
 * write only its own slice of the global state tree.
 * @ignore
 */
@Injectable({ providedIn: 'root' })
export class StateContextFactory {
  private _injector = inject(EnvironmentInjector);
  private _internalStateOperations = inject(InternalStateOperations);
  // Resolved lazily via `setErrorHandler` to avoid a cyclic dependency when
  // the ErrorHandler itself injects the Store.
  private _errorHandler: ErrorHandler | null = null;

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
          errorHandler?.handleError(new StateContextDestroyedError(path));
        }
        const currentAppState = root.getState();
        return getState(currentAppState, path);
      },
      patchState(value: Partial<T>): void {
        // If the injector has been destroyed (e.g. app destroyed mid-action),
        // skip the state update to avoid writing to completed subjects.
        if (injector.destroyed) {
          errorHandler?.handleError(new StateContextDestroyedError(path));
          return;
        }
        const currentAppState = root.getState();
        const patchOperator = simplePatch<T>(value);
        setStateFromOperator(root, currentAppState, patchOperator, path);
      },
      setState(value: T | StateOperator<T>): void {
        // Same guard as patchState — no-op if the injector is already destroyed.
        if (injector.destroyed) {
          errorHandler?.handleError(new StateContextDestroyedError(path));
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

  /** @internal */
  setErrorHandler(): void {
    // Called from `LifecycleStateManager.ngxsBootstrap` rather than at
    // construction time. If we injected ErrorHandler in the constructor,
    // an ErrorHandler that itself injects Store would create a circular
    // dependency — deferring the lookup breaks the cycle.
    this._errorHandler ??= this._injector.get(ErrorHandler);
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
  // Note: this returns the full app state rather than just the patched slice.
  // That's a long-standing quirk (present since the original state-factory.ts)
  // and fixing it would be a breaking change — tracked for a future release.
  return newAppState;
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
