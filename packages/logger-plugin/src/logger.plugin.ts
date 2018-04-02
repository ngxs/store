import { Injectable, Inject } from '@angular/core';
import { NgxsPlugin } from '@ngxs/store';
import { getActionTypeFromInstance } from '@ngxs/store';
import { NGXS_LOGGER_PLUGIN_OPTIONS, NgxsLoggerPluginOptions } from './symbols';
import { pad } from './internals';
import { tap } from 'rxjs/operators';

@Injectable()
export class NgxsLoggerPlugin implements NgxsPlugin {
  constructor(@Inject(NGXS_LOGGER_PLUGIN_OPTIONS) private _options: NgxsLoggerPluginOptions) {}

  handle(state, event, next) {
    const options = this._options || <any>{};
    const logger = options.logger || console;
    const actionName = getActionTypeFromInstance(event);
    const time = new Date();

    // tslint:disable-next-line
    const formattedTime = ` @ ${pad(time.getHours(), 2)}:${pad(time.getMinutes(), 2)}:${pad(
      time.getSeconds(),
      2
    )}.${pad(time.getMilliseconds(), 3)}`;

    const message = `action ${actionName.desc || actionName}${formattedTime}`;
    const startMessage = options.collapsed ? logger.groupCollapsed : logger.group;

    try {
      startMessage.call(logger, message);
    } catch (e) {
      console.log(message);
    }

    if (typeof event.payload !== 'undefined') {
      logger.log('%c payload', 'color: #9E9E9E; font-weight: bold', event.payload);
    }

    logger.log('%c prev state', 'color: #9E9E9E; font-weight: bold', state);

    return next(state, event).pipe(
      tap(nextState => {
        logger.log('%c next state', 'color: #4CAF50; font-weight: bold', nextState);
        try {
          logger.groupEnd();
        } catch (e) {
          logger.log('—— log end ——');
        }
      })
    );
  }
}
