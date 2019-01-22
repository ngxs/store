import { Inject, NgZone, PLATFORM_ID, Injectable } from '@angular/core';
import { isPlatformServer } from '@angular/common';

import { NgxsExecutionStrategy } from '../symbols';

@Injectable()
export class DispatchOutsideZoneNgxsExecutionStrategy implements NgxsExecutionStrategy {
  constructor(private _ngZone: NgZone, @Inject(PLATFORM_ID) private _platformId: Object) {}

  enter<T>(func: (...args: any[]) => T): T {
    if (isPlatformServer(this._platformId)) {
      return this.runInsideAngular(func);
    } else {
      return this.runOutsideAngular(func);
    }
  }

  leave<T>(func: (...args: any[]) => T): T {
    return this.runInsideAngular(func);
  }

  private runInsideAngular<T>(func: (...args: any[]) => T): T {
    if (NgZone.isInAngularZone()) {
      return func();
    }
    return this._ngZone.run(func);
  }

  private runOutsideAngular<T>(func: (...args: any[]) => T): T {
    if (NgZone.isInAngularZone()) {
      return this._ngZone.runOutsideAngular(func);
    }
    return func();
  }
}
