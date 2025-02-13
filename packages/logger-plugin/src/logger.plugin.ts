import { inject, Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Store } from '@ngxs/store';
import { NgxsNextPluginFn, NgxsPlugin } from '@ngxs/store/plugins';
import { catchError, tap } from 'rxjs';

import { LogWriter } from './log-writer';
import { ActionLogger } from './action-logger';
import { NGXS_LOGGER_PLUGIN_OPTIONS } from './symbols';

@Injectable()
export class NgxsLoggerPlugin implements NgxsPlugin {
  private _store: Store;
  private _logWriter: LogWriter;

  private _options = inject(NGXS_LOGGER_PLUGIN_OPTIONS);
  private _injector = inject(Injector);

  handle(state: any, event: any, next: NgxsNextPluginFn) {
    if (this._options.disabled || this._skipLogging(state, event)) {
      return next(state, event);
    }

    this._logWriter ||= new LogWriter(this._options);
    // Retrieve lazily to avoid cyclic dependency exception
    this._store ||= this._injector.get(Store);

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

  private _skipLogging(state: any, event: any) {
    // Run the `filter: () => ...` function within the injection context so
    // that the user can access the dependency injection and inject services
    // to retrieve properties. This will help determine whether or not to log the action.
    const allowLogging = runInInjectionContext(this._injector, () =>
      this._options.filter!(event, state)
    );

    return !allowLogging;
  }
}
