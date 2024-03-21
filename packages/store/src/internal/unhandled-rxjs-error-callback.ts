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

export function assignUnhandledCallback(error: any, callback: VoidFunction) {
  let hasBeenCalled = false;
  __unhandledRxjsErrorCallbacks.set(error, () => {
    if (!hasBeenCalled) {
      hasBeenCalled = true;
      callback();
    }
  });
  return error;
}
