import { Inject, Injectable } from '@angular/core';
import { Callback, NG_DEV_MODE, NG_TEST_MODE } from '../symbols';

@Injectable()
export class HostEnvironment {
  constructor(
    @Inject(NG_DEV_MODE) public isTestMode: Callback<boolean>,
    @Inject(NG_TEST_MODE) public isDevMode: Callback<boolean>
  ) {}
}
