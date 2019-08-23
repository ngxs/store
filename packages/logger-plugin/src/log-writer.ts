import { NgxsLoggerPluginOptions } from './symbols';
export class LogWriter {
  private logger: any;

  constructor(private options: NgxsLoggerPluginOptions) {
    this.options = this.options || <any>{};
    this.logger = options.logger || console;
  }

  startGroup(message: string) {
    const startGroupFn = this.options.collapsed
      ? this.logger.groupCollapsed
      : this.logger.group;
    try {
      startGroupFn.call(this.logger, message);
    } catch (e) {
      console.log(message);
    }
  }

  endGroup() {
    try {
      this.logger.groupEnd();
    } catch (e) {
      this.logger.log('—— log end ——');
    }
  }

  logGrey(title: string, payload: any) {
    const greyStyle = 'color: #9E9E9E; font-weight: bold';
    this.log(title, greyStyle, payload);
  }

  logGreen(title: string, payload: any) {
    const greenStyle = 'color: #4CAF50; font-weight: bold';
    this.log(title, greenStyle, payload);
  }

  logRedish(title: string, payload: any) {
    const redishStyle = 'color: #FD8182; font-weight: bold';
    this.log(title, redishStyle, payload);
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
}
