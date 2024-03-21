import { ErrorHandler, Inject, Injectable, NgZone, forwardRef } from '@angular/core';

export interface NgxsErrorContext {
  action?: any;
}

@Injectable({ providedIn: 'root' })
export class NgxsUnhandledErrorHandler {
  constructor(
    private _ngZone: NgZone,
    @Inject(forwardRef(() => ErrorHandler)) private _errorHandler: ErrorHandler
  ) {}

  handleError(_error: any, _context: NgxsErrorContext): void {
    // In order to avoid duplicate error handling, it is necessary to leave
    // the Angular zone to ensure that errors are not caught twice. The `handleError`
    // method may contain a `throw error` statement, which is used to re-throw the error.
    // If the error is re-thrown within the Angular zone, it will be caught again by the
    // Angular zone. By default, `@angular/core` leaves the Angular zone when invoking
    // `handleError` (see `_callAndReportToErrorHandler`).
    this._ngZone.runOutsideAngular(() => {
      this._errorHandler.handleError(_error);
    });
  }
}
