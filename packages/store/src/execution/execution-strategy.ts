import { inject, Injectable, NgZone } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InternalNgxsExecutionStrategy {
  private _ngZone = inject(NgZone);

  enter<T>(func: () => T): T {
    if (typeof ngServerMode !== 'undefined' && ngServerMode) {
      return this._runInsideAngular(func);
    }
    return this._runOutsideAngular(func);
  }

  leave<T>(func: () => T): T {
    return this._runInsideAngular(func);
  }

  private _runInsideAngular<T>(func: () => T): T {
    if (NgZone.isInAngularZone()) {
      return func();
    }
    return this._ngZone.run(func);
  }

  private _runOutsideAngular<T>(func: () => T): T {
    if (NgZone.isInAngularZone()) {
      return this._ngZone.runOutsideAngular(func);
    }
    return func();
  }
}
