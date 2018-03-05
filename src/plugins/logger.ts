import { NgxsPlugin } from '../symbols';

const repeat = (str, times) => new Array(times + 1).join(str);
const pad = (num, maxLength) => repeat('0', maxLength - num.toString().length) + num;

export interface LoggerPluginOptions {
  /** Auto expand logged mutations  */
  collapsed: boolean;

  /** Provide alternate console.log implementation */
  logger: any;
}

export class LoggerPlugin implements NgxsPlugin {
  static _options: LoggerPluginOptions | undefined = undefined;

  static forRoot(options: LoggerPluginOptions) {
    this._options = options;
  }

  handle(state, event, next) {
    const options = LoggerPlugin._options || <any>{};
    const logger = options.logger || console;
    const mutationName = event.constructor.type || event.constructor.name;
    const time = new Date();
    // tslint:disable-next-line
    const formattedTime = ` @ ${pad(time.getHours(), 2)}:${pad(time.getMinutes(), 2)}:${pad(
      time.getSeconds(),
      2
    )}.${pad(time.getMilliseconds(), 3)}`;
    const message = `mutation ${mutationName}${formattedTime}`;

    const startMessage = options.collapsed ? logger.groupCollapsed : logger.group;

    try {
      startMessage.call(logger, message);
    } catch (e) {
      console.log(message);
    }

    logger.log('%c prev state', 'color: #9E9E9E; font-weight: bold', state);
    const nextState = next(state, event);
    logger.log('%c next state', 'color: #4CAF50; font-weight: bold', nextState);

    try {
      logger.groupEnd();
    } catch (e) {
      logger.log('—— log end ——');
    }
  }
}
