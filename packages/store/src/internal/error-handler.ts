import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';

import { leaveNgxs } from '../operators/leave-ngxs';
import { NgxsExecutionStrategy } from '../execution/symbols';

/**
 * This operator is used for piping the observable result
 * from the `dispatch()`. It has a "smart" error handling
 * strategy that allows us to decide whether we propagate
 * errors to Angular's `ErrorHandler` or enable users to
 * handle them manually. We consider following cases:
 * 1) `store.dispatch()` (no subscribe) -> call `handleError()`
 * 2) `store.dispatch().subscribe()` (no error callback) -> call `handleError()`
 * 3) `store.dispatch().subscribe({ error: ... })` -> don't call `handleError()`
 * 4) `toPromise()` without `catch` -> do `handleError()`
 * 5) `toPromise()` with `catch` -> don't `handleError()`
 */
export function ngxsErrorHandler<T>(
  internalErrorReporter: InternalErrorReporter,
  ngxsExecutionStrategy: NgxsExecutionStrategy
) {
  return (source: Observable<T>) => {
    let subscribed = false;

    source.subscribe({
      error: error => {
        // Do not trigger change detection for a microtask. This depends on the execution
        // strategy being used, but the default `DispatchOutsideZoneNgxsExecutionStrategy`
        // leaves the Angular zone.
        ngxsExecutionStrategy.enter(() =>
          Promise.resolve().then(() => {
            if (!subscribed) {
              ngxsExecutionStrategy.leave(() =>
                internalErrorReporter.reportErrorSafely(error)
              );
            }
          })
        );
      }
    });

    return new Observable(subscriber => {
      subscribed = true;
      return source.pipe(leaveNgxs(ngxsExecutionStrategy)).subscribe(subscriber);
    });
  };
}

@Injectable({ providedIn: 'root' })
export class InternalErrorReporter {
  /** Will be set lazily to be backward compatible. */
  private _errorHandler: ErrorHandler = null!;

  constructor(private _injector: Injector) {}

  reportErrorSafely(error: any): void {
    if (this._errorHandler === null) {
      this._errorHandler = this._injector.get(ErrorHandler);
    }
    // The `try-catch` is used to avoid handling the error twice. Suppose we call
    // `handleError` which re-throws the error internally. The re-thrown error will
    // be caught by zone.js which will then get to the `zone.onError.emit()` and the
    // `onError` subscriber will call `handleError` again.
    try {
      this._errorHandler.handleError(error);
    } catch {}
  }
}
