import { Injectable, NgZone, isDevMode, ɵNoopNgZone as NoopNgZone } from '@angular/core';

import { isAngularInTestMode } from '../utils/angular';
import { NgxsConfig } from '../symbols';

@Injectable()
export class ConfigValidator {
  constructor(private config: NgxsConfig, private zone: NgZone) {}

  public verifyDevMode(): void {
    if (isAngularInTestMode()) {
      return;
    }

    const isNgxsDevMode = this.config.developmentMode;
    const isNgDevMode = isDevMode();
    const incorrectProduction = !isNgDevMode && isNgxsDevMode;
    const incorrectDevelopment = isNgDevMode && !isNgxsDevMode;
    const example = 'NgxsModule.forRoot(states, { developmentMode: !environment.production })';

    if (incorrectProduction) {
      console.warn(
        'Angular is running in production mode but NGXS is still running in the development mode!\n',
        'Please set developmentMode to false on the NgxsModule options when in production mode.\n',
        example
      );
    } else if (incorrectDevelopment) {
      console.warn(
        'RECOMMENDATION: Set developmentMode to true on the NgxsModule when Angular is running in development mode.\n',
        example
      );
    }
  }

  public verifyZoneIsNotNooped(): void {
    const outsideZone = !!this.config.outsideZone;
    if (outsideZone && this.zone instanceof NoopNgZone) {
      console.warn(
        '`outsideZone: true` cannot not be applied as your application was bootstrapped with nooped zone'
      );
    }
  }
}
