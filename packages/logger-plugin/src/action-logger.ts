import { getActionTypeFromInstance, Store } from '@ngxs/store';

import { pad } from './internals';
import { NgxsLoggerPluginOptions } from './symbols';

export class ActionLogger {
  constructor(
    private action: any,
    private logger: any,
    private options: NgxsLoggerPluginOptions,
    private store: Store
  ) {}

  dispatched(state: any) {
    const options = this.options;
    const logger = this.logger;
    const event = this.action;

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
  }

  completed(nextState: any) {
    this.log('next state', 'color: #4CAF50; font-weight: bold', nextState);
    this.endGroup();
  }

  errored(error: any) {
    this.log(
      'next state after error',
      'color: #FD8182; font-weight: bold',
      this.store.snapshot()
    );
    this.log('error', 'color: #FD8182; font-weight: bold', error);
    this.endGroup();
  }

  endGroup() {
    try {
      this.logger.groupEnd();
    } catch (e) {
      this.logger.log('—— log end ——');
    }
  }

  log(title: string, color: string, payload: any) {
    if (this.isIE()) {
      this.logger.log(title, payload);
    } else {
      this.logger.log('%c ' + title, color, payload);
    }
  }

  isIE(): boolean {
    const ua =
      typeof window !== 'undefined' && window.navigator.userAgent
        ? window.navigator.userAgent
        : '';
    let msIE = false;

    const oldIE = ua.indexOf('MSIE ');
    const newIE = ua.indexOf('Trident/');

    if (oldIE > -1 || newIE > -1) {
      msIE = true;
    }

    return msIE;
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
