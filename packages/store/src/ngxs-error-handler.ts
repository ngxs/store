import { ErrorHandler, Injectable, Injector, NgZone } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NgxsUnhandledErrorHandler {
  private _errorHandler: ErrorHandler = null!;

  constructor(
    private _ngZone: NgZone,
    private _injector: Injector
  ) {}

  handleError(_error: any, _context: any): void {
    // Retrieve lazily to avoid cyclic dependency exception.
    this._errorHandler ||= this._injector.get(ErrorHandler);
    // In order to avoid duplicate error handling, it is necessary to leave
    // the Angular zone to ensure that errors are not caught twice. The `handleError`
    // method may contain a `throw error` statement, which is used to re-throw the error.
    // If the error is re-thrown within the Angular zone, it will be caught again by the
    // Angular zone. By default, `@angular/core` leaves the Angular zone when invoking
    // `handleError` (see `_callAndReportToErrorHandler`).
    this._ngZone.runOutsideAngular(() => {
      // Decide what we wanna pass here...
      this._errorHandler.handleError(_error);
    });
  }
}
