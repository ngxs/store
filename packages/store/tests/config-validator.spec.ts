import { TestBed } from '@angular/core/testing';
import { NgxsModule } from '@ngxs/store';

import { ConfigValidator } from '../src/internal/validation/config-validator';
import { NG_TEST_MODE, NGXS_TEST_MODE } from '../src/symbols';
import {
  CONFIG_MESSAGES,
  VALIDATION_CODE
} from '../src/internal/validation/validation-messages.config';

describe('ConfigValidator', () => {
  let validator: ConfigValidator;

  it('should be correct detect isNgDevMode when isTestMode = true', () => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([])]
    });

    validator = TestBed.get(ConfigValidator);

    expect(validator.isNgDevMode()).toBe(true);
    expect(validator.isTestMode()).toBe(true);
    expect(validator.verifyDevMode()).toBe(undefined);
  });

  it('should be show warn message incorrect development mode', () => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([], { developmentMode: false })],
      providers: [{ provide: NGXS_TEST_MODE, useValue: () => false }]
    });

    spyOn(console, 'warn');

    validator = TestBed.get(ConfigValidator);

    expect(validator.isNgDevMode()).toBe(true);
    expect(validator.isTestMode()).toBe(false);
    expect(console.warn).toHaveBeenCalledWith(
      CONFIG_MESSAGES[VALIDATION_CODE.INCORRECT_DEVELOPMENT]
    );
  });

  it('should be show warn message when incorrect production mode', () => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([], { developmentMode: true })],
      providers: [
        { provide: NGXS_TEST_MODE, useValue: () => false },
        { provide: NG_TEST_MODE, useValue: () => false }
      ]
    });

    spyOn(console, 'warn');

    validator = TestBed.get(ConfigValidator);

    expect(validator.isNgDevMode()).toBe(false);
    expect(validator.isTestMode()).toBe(false);
    expect(console.warn).toHaveBeenCalledWith(
      CONFIG_MESSAGES[VALIDATION_CODE.INCORRECT_PRODUCTION]
    );
  });
});
