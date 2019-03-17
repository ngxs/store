import { Injectable, isDevMode } from '@angular/core';
import { isAngularInTestMode } from '@ngxs/store/internals';

import { NgxsConfig } from '../symbols';

@Injectable()
export class ConfigValidator {
  constructor(private _config: NgxsConfig) {}

  public verifyDevMode(): void {
    if (isAngularInTestMode()) {
      return;
    }

    const isNgxsDevMode = this._config.developmentMode;
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
}
