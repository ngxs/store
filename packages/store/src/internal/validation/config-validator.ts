import { Inject, Injectable } from '@angular/core';

import {
  CONFIG_MESSAGES as MESSAGES,
  VALIDATION_CODE as CODE
} from '../validation/validation-messages.config';
import { NG_DEV_MODE, NGXS_TEST_MODE, NgxsConfig } from '../../symbols';

@Injectable()
export class ConfigValidator {
  constructor(
    @Inject(NGXS_TEST_MODE) public isTestMode: Function,
    @Inject(NG_DEV_MODE) public isNgDevMode: Function,
    private _config: NgxsConfig
  ) {}

  private get isIncorrectProduction(): boolean {
    return !this.isTestMode() && !this.isNgDevMode() && this._config.developmentMode;
  }

  private get isIncorrectDevelopment(): boolean {
    return !this.isTestMode() && this.isNgDevMode() && !this._config.developmentMode;
  }

  public verifyDevMode(): void {
    if (this.isIncorrectProduction) {
      console.warn(MESSAGES[CODE.INCORRECT_PRODUCTION]);
    } else if (this.isIncorrectDevelopment) {
      console.warn(MESSAGES[CODE.INCORRECT_DEVELOPMENT]);
    }
  }
}
