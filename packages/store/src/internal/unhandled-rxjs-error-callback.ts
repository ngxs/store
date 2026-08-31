import { config } from 'rxjs';

const ɵɵunhandledRxjsErrorCallbacks = new WeakMap<object, VoidFunction>();

let installed = false;
export function installOnUnhandhedErrorHandler(): void {
  if (installed) {
    return;
  }

  const existingHandler = config.onUnhandledError;
  config.onUnhandledError = function (error: any) {
    const unhandledErrorCallback = ɵɵunhandledRxjsErrorCallbacks.get(error);
    if (unhandledErrorCallback) {
      unhandledErrorCallback();
    } else if (existingHandler) {
      existingHandler.call(this, error);
    } else {
      throw error;
    }
  };

  installed = true;
}

export function executeUnhandledCallback(error: any) {
  const unhandledErrorCallback = ɵɵunhandledRxjsErrorCallbacks.get(error);
  if (unhandledErrorCallback) {
    unhandledErrorCallback();
    return true;
  }
  return false;
}

export function assignUnhandledCallback(error: any, callback: VoidFunction) {
  // The error can be anything - `throwError('My Error')` throws a plain string,
  // for one. WeakMap keys have to be objects, so only handle it when it is one.
  if (error && typeof error === 'object') {
    let hasBeenCalled = false;
    ɵɵunhandledRxjsErrorCallbacks.set(error, () => {
      if (!hasBeenCalled) {
        hasBeenCalled = true;
        callback();
      }
    });
  }
  return error;
}
