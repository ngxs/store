import { Injectable, Inject } from '@angular/core';
import { tap, finalize, catchError } from 'rxjs/operators';

import { NgxsPlugin, getActionTypeFromInstance, NgxsNextPluginFn } from '@ngxs/store';

import { NGXS_LOGGER_PLUGIN_OPTIONS, NgxsLoggerPluginOptions } from './symbols';
import { pad } from './internals';

@Injectable()
export class NgxsLoggerPlugin implements NgxsPlugin {
  constructor(@Inject(NGXS_LOGGER_PLUGIN_OPTIONS) private _options: NgxsLoggerPluginOptions) {}

  handle(state: any, event: any, next: NgxsNextPluginFn) {
    if (this._options.disabled) {
      return next(state, event);
    }

    const options = this._options || <any>{};
    const logger = options.logger || console;
    const actionName = getActionTypeFromInstance(event);
    const time = new Date();

    // tslint:disable-next-line
    const formattedTime = ` @ ${pad(time.getHours(), 2)}:${pad(time.getMinutes(), 2)}:${pad(
      time.getSeconds(),
      2
    )}.${pad(time.getMilliseconds(), 3)}`;

    const message = `action ${actionName}${formattedTime}`;
    const startMessage = options.collapsed ? logger.groupCollapsed : logger.group;

    try {
      startMessage.call(logger, message);
    } catch (e) {
      console.log(message);
    }

    // print payload only if at least one property is supplied
    if (this._hasPayload(event)) {
      this.log('payload', 'color: #9E9E9E; font-weight: bold', { ...event });
    }

    this.log('prev state', 'color: #9E9E9E; font-weight: bold', state);

    return next(state, event).pipe(
      tap(nextState => {
        this.log('next state', 'color: #4CAF50; font-weight: bold', nextState);
      }),
      catchError(error => {
        this.log('error', 'color: #FD8182; font-weight: bold', error);

        throw error;
      }),
      finalize(() => {
        try {
          logger.groupEnd();
        } catch (e) {
          logger.log('—— log end ——');
        }
      })
    );
  }

  log(title: string, color: string, payload: any) {
    const options = this._options || <any>{};
    const logger = options.logger || console;

    if (this.isIE()) {
      logger.log(title, payload);
    } else {
      logger.log('%c ' + title, color, payload);
    }
  }

  isIE(): boolean {
    const ua =
      typeof window !== 'undefined' && window.navigator.userAgent
        ? window.navigator.userAgent
        : '';
    let ms_ie = false;

    const old_ie = ua.indexOf('MSIE ');
    const new_ie = ua.indexOf('Trident/');

    if (old_ie > -1 || new_ie > -1) {
      ms_ie = true;
    }

    return ms_ie;
  }

  private _hasPayload(event: any) {
    const nonEmptyProperties = this._getNonEmptyProperties(event);
    return nonEmptyProperties.length > 0;
  }

  private _getNonEmptyProperties(event: any) {
    const keys = Object.keys(event);
    const values = keys.map(key => event[key]);
    return values.filter(value => !!value);
  }
}
