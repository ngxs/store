import { ErrorHandler, Injectable, NgZone, inject } from '@angular/core';

export interface NgxsUnhandledErrorContext {
  action: any;
}

@Injectable({ providedIn: 'root' })
export class NgxsUnhandledErrorHandler {
  private _ngZone = inject(NgZone);
  private _errorHandler = inject(ErrorHandler);

  /**
   * The `_unhandledErrorContext` is left unused internally since we do not
   * require it for internal operations. However, developers who wish to provide
   * their own custom error handler may utilize this context information.
   */
  handleError(error: any, _unhandledErrorContext: NgxsUnhandledErrorContext): void {
    // In order to avoid duplicate error handling, it is necessary to leave
    // the Angular zone to ensure that errors are not caught twice. The `handleError`
    // method may contain a `throw error` statement, which is used to re-throw the error.
    // If the error is re-thrown within the Angular zone, it will be caught again by the
    // Angular zone. By default, `@angular/core` leaves the Angular zone when invoking
    // `handleError` (see `_callAndReportToErrorHandler`).
    this._ngZone.runOutsideAngular(() => this._errorHandler.handleError(error));
  }
}
