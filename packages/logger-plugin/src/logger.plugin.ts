import { Injectable, Inject, Injector } from '@angular/core';
import { tap, catchError } from 'rxjs/operators';

import { NgxsPlugin, NgxsNextPluginFn, Store } from '@ngxs/store';

import { NGXS_LOGGER_PLUGIN_OPTIONS, NgxsLoggerPluginOptions } from './symbols';
import { ActionLogger } from './action-logger';
import { LogWriter } from './log-writer';

@Injectable()
export class NgxsLoggerPlugin implements NgxsPlugin {
  constructor(
    @Inject(NGXS_LOGGER_PLUGIN_OPTIONS) private _options: NgxsLoggerPluginOptions,
    private _injector: Injector
  ) {}

  handle(state: any, event: any, next: NgxsNextPluginFn) {
    if (this._options.disabled) {
      return next(state, event);
    }

    const logWriter = new LogWriter(this._options);
    // Retrieve lazily to avoid cyclic dependency exception
    const store = this._injector.get<Store>(Store);

    const actionLogger = new ActionLogger(event, store, logWriter);

    actionLogger.dispatched(state);

    return next(state, event).pipe(
      tap(nextState => {
        actionLogger.completed(nextState);
      }),
      catchError(error => {
        actionLogger.errored(error);
        throw error;
      })
    );
  }
}
