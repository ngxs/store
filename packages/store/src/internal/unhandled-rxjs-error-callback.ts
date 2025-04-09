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
  // Since the error can be essentially anything, we must ensure that we only
  // handle objects, as weak maps do not allow any other key type besides objects.
  // The error can also be a string if thrown in the following manner: `throwError('My Error')`.
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
