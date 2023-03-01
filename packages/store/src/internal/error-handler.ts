import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
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
  enableDualErrorHandling: boolean,
  ngZone: NgZone,
  internalErrorReporter: InternalErrorReporter,
  ngxsExecutionStrategy: NgxsExecutionStrategy
) {
  return (source: Observable<T>) => {
    let subscribed = false;

    source.subscribe({
      error: error => {
        // When `enableDualErrorHandling` is truthy (which is the default setting),
        // we always invoke the `ErrorHandler`. In addition, if the `error` observer is
        // provided, the error may also be propagated to the user. This is why it is
        // referred to as "dual" error handling.
        if (enableDualErrorHandling) {
          internalErrorReporter.report(error);
        } else {
          // To prevent redundant change detection, it is necessary to leave
          // the Angular zone regardless of the NGXS execution strategy being used.
          scheduleMicrotask(ngZone, () => {
            if (!subscribed) {
              internalErrorReporter.report(error);
            }
          });
        }
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
  private _errorHandler: ErrorHandler = null!;

  constructor(private _ngZone: NgZone, private _injector: Injector) {}

  report(error: any): void {
    // Retrieve lazily to avoid cyclic dependency exception.
    this._errorHandler ||= this._injector.get(ErrorHandler);
    // In order to avoid duplicate error handling, it is necessary to leave
    // the Angular zone to ensure that errors are not caught twice. The `handleError`
    // method may contain a `throw error` statement, which is used to re-throw the error.
    // If the error is re-thrown within the Angular zone, it will be caught again by the
    // Angular zone. By default, `@angular/core` leaves the Angular zone when invoking
    // `handleError` (see `_callAndReportToErrorHandler`).
    this._ngZone.runOutsideAngular(() => this._errorHandler.handleError(error));
  }
}

const promise = Promise.resolve();
function scheduleMicrotask(ngZone: NgZone, cb: VoidFunction) {
  return ngZone.runOutsideAngular(() => promise.then(cb));
}
