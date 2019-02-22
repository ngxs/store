import {
  NgZone,
  PLATFORM_ID,
  Injectable,
  ɵNoopNgZone as NoopNgZone,
  Inject
} from '@angular/core';
import { isPlatformServer } from '@angular/common';

import { NgxsExecutionStrategy } from './symbols';

@Injectable()
export class DispatchOutsideZoneNgxsExecutionStrategy implements NgxsExecutionStrategy {
  constructor(private _ngZone: NgZone, @Inject(PLATFORM_ID) private _platformId: Object) {
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
    /* - Removed because unsafe for Angular 5 - investigate
    if (ngZone instanceof NoopNgZone) {
      console.warn(
        'Your application was bootstrapped with nooped zone and your execution strategy requires an ngZone'
      );
    }
    */
  }
}
