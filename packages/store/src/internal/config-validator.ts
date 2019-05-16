import { Injectable } from '@angular/core';

import {
  CONFIG_MESSAGES as MESSAGES,
  VALIDATION_CODE as CODE
} from '../configs/messages.config';
import { NgxsConfig } from '../symbols';
import { HostEnvironment } from '../host-environment/host-environment';

@Injectable()
export class ConfigValidator {
  constructor(private _host: HostEnvironment, private _config: NgxsConfig) {}

  private get isIncorrectProduction(): boolean {
    return !this._host.isDevMode() && this._config.developmentMode;
  }

  private get isIncorrectDevelopment(): boolean {
    return this._host.isDevMode() && !this._config.developmentMode;
  }

  public verifyDevMode(): void {
    if (this._host.isTestMode()) {
      return;
    }

    if (this.isIncorrectProduction) {
      console.warn(MESSAGES[CODE.INCORRECT_PRODUCTION]());
    } else if (this.isIncorrectDevelopment) {
      console.warn(MESSAGES[CODE.INCORRECT_DEVELOPMENT]());
    }
  }
}
