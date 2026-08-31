import { ErrorHandler, Injectable, NgZone, inject } from '@angular/core';

export interface NgxsUnhandledErrorContext {
  action: any;
}

@Injectable({ providedIn: 'root' })
export class NgxsUnhandledErrorHandler {
  private _ngZone = inject(NgZone);
  private _errorHandler = inject(ErrorHandler);

  /**
   * We don't use `_unhandledErrorContext` ourselves - it's here for custom
   * error handlers that want the extra context.
   */
  handleError(error: any, _unhandledErrorContext: NgxsUnhandledErrorContext): void {
    // Run outside the Angular zone so a re-thrown error isn't caught twice.
    // `handleError` often ends with `throw error` to re-throw; do that inside
    // the zone and the zone catches it again. `@angular/core` already leaves the
    // zone before calling `handleError` (see `_callAndReportToErrorHandler`).
    this._ngZone.runOutsideAngular(() => this._errorHandler.handleError(error));
  }
}
