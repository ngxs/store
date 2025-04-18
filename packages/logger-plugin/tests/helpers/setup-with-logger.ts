import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DispatchOutsideZoneNgxsExecutionStrategy, Store, provideStore } from '@ngxs/store';
import { ɵStateClass } from '@ngxs/store/internals';
import { NgxsLoggerPluginOptions, withNgxsLoggerPlugin } from '@ngxs/logger-plugin';

import { LoggerSpy } from './logger-spy';
import { NoopErrorHandler } from '../../../store/tests/helpers/utils';

export function setupWithLogger(states: ɵStateClass[], opts?: NgxsLoggerPluginOptions) {
  const logger = new LoggerSpy();

  TestBed.configureTestingModule({
    providers: [
      provideStore(
        states,
        {
          executionStrategy: DispatchOutsideZoneNgxsExecutionStrategy
        },
        withNgxsLoggerPlugin({ ...opts, logger })
      ),
      { provide: ErrorHandler, useClass: NoopErrorHandler }
    ]
  });

  const store: Store = TestBed.inject(Store);

  return {
    store,
    logger
  };
}
