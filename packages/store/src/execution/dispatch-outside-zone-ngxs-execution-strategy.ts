import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

import { NgxsExecutionStrategy } from './symbols';
import { getZoneWarningMessage } from '../configs/messages.config';

@Injectable({ providedIn: 'root' })
export class DispatchOutsideZoneNgxsExecutionStrategy implements NgxsExecutionStrategy {
  constructor(private _ngZone: NgZone, @Inject(PLATFORM_ID) private _platformId: string) {
    // Caretaker note: we have still left the `typeof` condition in order to avoid
    // creating a breaking change for projects that still use the View Engine.
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      verifyZoneIsNotNooped(_ngZone);
    }
  }

  enter<T>(func: () => T): T {
    if (isPlatformServer(this._platformId)) {
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
