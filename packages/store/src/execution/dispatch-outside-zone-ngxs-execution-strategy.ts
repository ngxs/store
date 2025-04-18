import { inject, Injectable, NgZone } from '@angular/core';

import { NgxsExecutionStrategy } from './symbols';
import { getZoneWarningMessage } from '../configs/messages.config';

@Injectable({ providedIn: 'root' })
export class DispatchOutsideZoneNgxsExecutionStrategy implements NgxsExecutionStrategy {
  private _ngZone = inject(NgZone);

  constructor() {
    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
      verifyZoneIsNotNooped(this._ngZone);
    }
  }

  enter<T>(func: () => T): T {
    if (typeof ngServerMode !== 'undefined' && ngServerMode) {
      return this.runInsideAngular(func);
    }
    return this.runOutsideAngular(func);
  }

  leave<T>(func: () => T): T {
    return this.runInsideAngular(func);
  }

  private runInsideAngular<T>(func: () => T): T {
    if (NgZone.isInAngularZone()) {
      return func();
    }
    return this._ngZone.run(func);
  }

  private runOutsideAngular<T>(func: () => T): T {
    if (NgZone.isInAngularZone()) {
      return this._ngZone.runOutsideAngular(func);
    }
    return func();
  }
}

// Caretaker note: this should exist as a separate function and not a class method,
// since class methods are not tree-shakable.
function verifyZoneIsNotNooped(ngZone: NgZone): void {
  // `NoopNgZone` is not exposed publicly as it doesn't expect
  // to be used outside of the core Angular code, thus we just have
  // to check if the zone doesn't extend or instanceof `NgZone`.
  if (ngZone instanceof NgZone) {
    return;
  }

  console.warn(getZoneWarningMessage());
}
