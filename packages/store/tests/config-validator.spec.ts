import { TestBed } from '@angular/core/testing';
import { NgxsModule } from '@ngxs/store';

import { ConfigValidator } from '../src/internal/config-validator';
import { HostEnvironment } from '../src/host-environment/host-environment';
import { NG_DEV_MODE, NG_TEST_MODE } from '../src/symbols';
import { CONFIG_MESSAGES, VALIDATION_CODE } from '../src/configs/messages.config';

describe('ConfigValidator', () => {
  let validator: ConfigValidator;
  let host: HostEnvironment;
  let actualWarning: string;

  console.warn = (...args: string[]) => (actualWarning = args[0]);

  it('should be correct detect isNgDevMode when isTestMode = true', () => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([])]
    });

    validator = TestBed.get(ConfigValidator);
    host = TestBed.get(HostEnvironment);

    expect(host.isDevMode()).toBe(true);
    expect(host.isTestMode()).toBe(true);
    expect(validator.verifyDevMode()).toBe(undefined);
  });

  it('should be show warn message incorrect development mode', () => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([], { developmentMode: false })],
      providers: [{ provide: NG_DEV_MODE, useValue: () => false }]
    });

    validator = TestBed.get(ConfigValidator);
    host = TestBed.get(HostEnvironment);

    expect(host.isDevMode()).toBe(true);
    expect(host.isTestMode()).toBe(false);

    const INCORRECT_DEVELOPMENT = CONFIG_MESSAGES[VALIDATION_CODE.INCORRECT_DEVELOPMENT]();
    expect(actualWarning).toBe(INCORRECT_DEVELOPMENT);
  });

  it('should be show warn message when incorrect production mode', () => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([], { developmentMode: true })],
      providers: [
        { provide: NG_DEV_MODE, useValue: () => false },
        { provide: NG_TEST_MODE, useValue: () => false }
      ]
    });

    validator = TestBed.get(ConfigValidator);
    host = TestBed.get(HostEnvironment);

    expect(host.isDevMode()).toBe(false);
    expect(host.isTestMode()).toBe(false);

    const INCORRECT_PRODUCTION = CONFIG_MESSAGES[VALIDATION_CODE.INCORRECT_PRODUCTION]();
    expect(actualWarning).toBe(INCORRECT_PRODUCTION);
  });
});
