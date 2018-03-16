import { Injectable, Inject } from '@angular/core';
import { tap } from 'rxjs/operators';

import { NgxsPlugin } from '../../symbols';
import { getTypeFromInstance } from '../../internals';

import { LOGGER_PLUGIN_OPTIONS, LoggerPluginOptions } from './symbols';
import { pad } from './internals';

@Injectable()
export class LoggerPlugin implements NgxsPlugin {
  constructor(@Inject(LOGGER_PLUGIN_OPTIONS) private _options: LoggerPluginOptions) {}

  handle(state, event, next) {
    const options = this._options || <any>{};
    const logger = options.logger || console;
    const actionName = getTypeFromInstance(event);
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
