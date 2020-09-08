import { Inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';

import { NgxsExecutionStrategy } from './symbols';
import { CONFIG_MESSAGES, VALIDATION_CODE } from '../configs/messages.config';

@Injectable()
export class DispatchOutsideZoneNgxsExecutionStrategy implements NgxsExecutionStrategy {
  constructor(private _ngZone: NgZone, @Inject(PLATFORM_ID) private _platformId: string) {
    this.verifyZoneIsNotNooped(this._ngZone);
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

  private verifyZoneIsNotNooped(ngZone: NgZone): void {
    // `NoopNgZone` is not exposed publicly as it doesn't expect
    // to be used outside of the core Angular code, thus we just have
    // to check if the zone doesn't extend or instanceof `NgZone`
    if (ngZone instanceof NgZone) {
      return;
    }

    console.warn(CONFIG_MESSAGES[VALIDATION_CODE.ZONE_WARNING]());
  }
}
