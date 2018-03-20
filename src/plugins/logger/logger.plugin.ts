import { Injectable, Inject } from '@angular/core';
import { NgxsPlugin } from '../../symbols';
import { NGXS_LOGGER_PLUGIN_OPTIONS, NgxsLoggerPluginOptions } from './symbols';
import { pad } from './internals';
import { tap } from 'rxjs/operators';
import { getTypeFromInstance } from '../../internals';

@Injectable()
export class NgxsLoggerPlugin implements NgxsPlugin {
  constructor(@Inject(NGXS_LOGGER_PLUGIN_OPTIONS) private _options: NgxsLoggerPluginOptions) {}

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

    const res = next(state, event);

    res.subscribe(nextState => {
      logger.log('%c next state', 'color: #4CAF50; font-weight: bold', nextState);
      try {
        logger.groupEnd();
      } catch (e) {
        logger.log('—— log end ——');
      }
    });

    return res;
  }
}
