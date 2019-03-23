import { CallStack } from './symbols';

/**
 * Spy that mimics the required methods for custom logger implementation,
 *   just like console logger.
 */
export class LoggerSpy {
  private _callStack: CallStack = [];

  static createCallStack(callStack: CallStack): string {
    return JSON.stringify(callStack);
  }

  group(...label: any[]) {
    this._callStack.push(['group', ...label]);
  }

  groupCollapsed(...label: any[]) {
    this._callStack.push(['groupCollapsed', ...label]);
  }

  groupEnd() {
    this._callStack.push(['groupEnd']);
  }

  log(message?: any, ...optionalParams: any[]) {
    this._callStack.push(['log', message, ...optionalParams]);
  }

  get callStack(): string {
    const callStackWithoutTime = this._callStack.map(call => {
      const callSecondParam = call[1] as string;

      // remove formatted time string
      if (typeof callSecondParam === 'string') {
        call[1] = callSecondParam.replace(/\d{2}:\d{2}:\d{2}.\d{3}/g, '');
      }

      return call;
    });

    return LoggerSpy.createCallStack(callStackWithoutTime);
  }
}
