import { Inject, Injectable } from '@angular/core';
import { NG_DEV_MODE, NG_TEST_MODE } from '../symbols';
import { Callback } from '../internal/internals';

@Injectable()
export class HostEnvironment {
  constructor(
    @Inject(NG_DEV_MODE) public isNgDevMode: Callback<boolean>,
    @Inject(NG_TEST_MODE) public isNgTestMode: Callback<boolean>
  ) {}
}
