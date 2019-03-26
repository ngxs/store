import { TestBed } from '@angular/core/testing';
import { NgxsModule } from '@ngxs/store';

import { ConfigValidator } from '../src/internal/config-validator';
import { NGXS_DEV_MODE } from '../src/symbols';

describe('ConfigValidator', () => {
  let validator: ConfigValidator;

  it('should be correct detect isNgDevMode when isTestMode = true', () => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([])]
    });

    validator = TestBed.get(ConfigValidator);

    expect(validator.isNgDevMode).toBe(true);
    expect(validator.isTestMode()).toBe(true);
    expect(validator.verifyDevMode()).toBe(undefined);
  });

  it('should be throw when incorrect development mode', () => {
    try {
      TestBed.configureTestingModule({
        imports: [NgxsModule.forRoot([], { developmentMode: false })],
        providers: [{ provide: NGXS_DEV_MODE, useValue: () => false }]
      });
      validator = TestBed.get(ConfigValidator);
    } catch (e) {
      expect(e instanceof Error).toBe(true);
    }
  });
});
