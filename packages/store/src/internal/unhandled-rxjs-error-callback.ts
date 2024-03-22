import { config } from 'rxjs';

const __unhandledRxjsErrorCallbacks = new WeakMap<any, VoidFunction>();

const existingHandler = config.onUnhandledError;
config.onUnhandledError = function (error: any) {
  const unhandledErrorCallback = __unhandledRxjsErrorCallbacks.get(error);
  if (unhandledErrorCallback) {
    unhandledErrorCallback();
  } else if (existingHandler) {
    existingHandler.call(this, error);
  } else {
    throw error;
  }
};

export function executeUnhandledCallback(error: any) {
  const unhandledErrorCallback = __unhandledRxjsErrorCallbacks.get(error);
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
  if (error !== null && typeof error === 'object') {
    let hasBeenCalled = false;
    __unhandledRxjsErrorCallbacks.set(error, () => {
      if (!hasBeenCalled) {
        hasBeenCalled = true;
        callback();
      }
    });
  }
  return error;
}
