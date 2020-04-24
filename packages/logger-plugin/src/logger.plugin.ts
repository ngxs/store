import { Inject, Injectable, Injector } from '@angular/core';
import { NgxsNextPluginFn, NgxsPlugin, Store } from '@ngxs/store';
import { catchError, tap } from 'rxjs/operators';
import { ActionLogger } from './action-logger';
import { LogWriter } from './log-writer';
import { NgxsLoggerPluginOptions, NGXS_LOGGER_PLUGIN_OPTIONS } from './symbols';

@Injectable()
export class NgxsLoggerPlugin implements NgxsPlugin {
  private _store: Store;
  private _logWriter: LogWriter;

  constructor(
    @Inject(NGXS_LOGGER_PLUGIN_OPTIONS) private _options: NgxsLoggerPluginOptions,
    private _injector: Injector
  ) {}

  handle(state: any, event: any, next: NgxsNextPluginFn) {
    if (this._options.disabled || !this._options.filter!(event)) {
      return next(state, event);
    }

    this._logWriter = this._logWriter || new LogWriter(this._options);
    // Retrieve lazily to avoid cyclic dependency exception
    this._store = this._store || this._injector.get<Store>(Store);

    const actionLogger = new ActionLogger(event, this._store, this._logWriter);

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
