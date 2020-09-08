import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxsModule, Store } from '@ngxs/store';
import { StateClass } from '@ngxs/store/internals';

import { LoggerSpy } from './logger-spy';
import { NoopErrorHandler } from '../../../store/tests/helpers/utils';
import { NgxsLoggerPluginModule, NgxsLoggerPluginOptions } from '../../';

export function setupWithLogger(states: StateClass[], opts?: NgxsLoggerPluginOptions) {
  const logger = new LoggerSpy();

  TestBed.configureTestingModule({
    imports: [
      NgxsModule.forRoot(states),
      NgxsLoggerPluginModule.forRoot({
        ...opts,
        logger
      })
    ],
    providers: [{ provide: ErrorHandler, useClass: NoopErrorHandler }]
  });

  const store: Store = TestBed.inject(Store);

  return {
    store,
    logger
  };
}
