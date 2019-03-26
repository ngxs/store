import { Inject, Injectable, isDevMode } from '@angular/core';

import { NGXS_DEV_MODE, NgxsConfig } from '../symbols';
import { StoreValidators } from '../utils/store-validators';

interface ConfigValidatorDef {
  readonly isNgDevMode: boolean;
  readonly isNgxsDevMode: boolean;
}

@Injectable()
export class ConfigValidator implements ConfigValidatorDef {
  constructor(
    @Inject(NGXS_DEV_MODE) public isTestMode: Function,
    private _config: NgxsConfig
  ) {}

  public get isNgDevMode(): boolean {
    return isDevMode();
  }

  public get isNgxsDevMode(): boolean {
    return this._config.developmentMode;
  }

  private get isIncorrectProduction(): boolean {
    return !this.isTestMode() && !this.isNgDevMode && this.isNgxsDevMode;
  }

  private get isIncorrectDevelopment(): boolean {
    return !this.isTestMode() && this.isNgDevMode && !this.isNgxsDevMode;
  }

  public verifyDevMode(): void {
    if (this.isIncorrectProduction) {
      StoreValidators.throwWhenIncorrectProduction();
    } else if (this.isIncorrectDevelopment) {
      StoreValidators.throwWhenIncorrectDevelopment();
    }
  }
}
