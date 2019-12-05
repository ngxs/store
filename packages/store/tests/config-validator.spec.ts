import { TestBed } from '@angular/core/testing';
import { NgxsModule } from '@ngxs/store';

import { ConfigValidator } from '../src/internal/config-validator';
import { HostEnvironment } from '../src/host-environment/host-environment';
import { NG_DEV_MODE, NG_TEST_MODE } from '../src/symbols';
import { CONFIG_MESSAGES, VALIDATION_CODE } from '../src/configs/messages.config';

describe('ConfigValidator', () => {
  let validator: ConfigValidator;
  let host: HostEnvironment;

  it('should be correct detect isNgDevMode when isTestMode = true', () => {
    // Arrange & act
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([])]
    });

    validator = TestBed.get(ConfigValidator);
    host = TestBed.get(HostEnvironment);

    // Assert
    expect(host.isTestMode()).toBe(true);
    expect(host.isDevMode()).toBe(true);
    expect(validator.verifyDevMode()).toBe(undefined);
  });

  it('should be show warn message incorrect development mode', () => {
    // Arrange & act
    const spy = jest.spyOn(console, 'warn').mockImplementation();

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([], { developmentMode: false })],
      providers: [{ provide: NG_TEST_MODE, useValue: () => false }]
    });

    validator = TestBed.get(ConfigValidator);
    host = TestBed.get(HostEnvironment);

    try {
      // Assert
      expect(host.isTestMode()).toBe(false);
      expect(host.isDevMode()).toBe(true);
      const INCORRECT_DEVELOPMENT = CONFIG_MESSAGES[VALIDATION_CODE.INCORRECT_DEVELOPMENT]();
      expect(spy).toHaveBeenCalledWith(INCORRECT_DEVELOPMENT);
    } finally {
      spy.mockRestore();
    }
  });

  it('should be show warn message when incorrect production mode', () => {
    // Arrange & act
    const spy = jest.spyOn(console, 'warn').mockImplementation();

    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([], { developmentMode: true })],
      providers: [
        { provide: NG_DEV_MODE, useValue: () => false },
        { provide: NG_TEST_MODE, useValue: () => false }
      ]
    });

    validator = TestBed.get(ConfigValidator);
    host = TestBed.get(HostEnvironment);

    try {
      // Assert
      expect(host.isDevMode()).toBe(false);
      expect(host.isTestMode()).toBe(false);
      const INCORRECT_PRODUCTION = CONFIG_MESSAGES[VALIDATION_CODE.INCORRECT_PRODUCTION]();
      expect(spy).toHaveBeenCalledWith(INCORRECT_PRODUCTION);
    } finally {
      spy.mockRestore();
    }
  });
});
