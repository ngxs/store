import { CallStack, Call } from './symbols';

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

  clear() {
    this._callStack = [];
  }

  get callStack(): string {
    const callStackWithoutTime = this.getCallStack();
    return LoggerSpy.createCallStack(callStackWithoutTime);
  }

  getCallStack(options: { excludeStyles?: boolean } = {}): any[] {
    return this._callStack.map(call => {
      call = removeTime(call);
      if (options.excludeStyles) {
        call = removeStyle(call);
      }
      return call;
    });
  }
}

function removeTime(item: Call): Call {
  const [first, second, ...rest] = item;
  if (typeof second === 'string') {
    return [first, second.replace(/\d{2}:\d{2}:\d{2}.\d{3}/g, ''), ...rest];
  }
  return item;
}

function removeStyle(item: Call): Call {
  const [first, second, , ...rest] = item;
  if (typeof second === 'string' && second.startsWith('%c ')) {
    return [first, second.substring(3), ...rest];
  }
  return item;
}
