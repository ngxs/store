import { config } from 'rxjs';

const UnhandledErrorContextSymbol = Symbol('NGXS_UnhandledErrorContext');

interface UnhandledErrorContext {
  handle: VoidFunction;
}

const existingHandler = config.onUnhandledError;
config.onUnhandledError = function (error: any) {
  const unhandledErrorContext: UnhandledErrorContext = error?.[UnhandledErrorContextSymbol];
  if (unhandledErrorContext) {
    unhandledErrorContext.handle();
  } else if (existingHandler) {
    existingHandler.call(this, error);
  } else {
    throw error;
  }
};

export function assignUnhandledCallback(error: any, callback: VoidFunction) {
  let hasBeenCalled = false;
  const unhandledErrorContext: UnhandledErrorContext = {
    handle: () => {
      if (!hasBeenCalled) {
        hasBeenCalled = true;
        callback();
      }
    }
  };

  // We create our own object to represent the error and set the original error as the prototype
  // This allows us to add our symbol with the callback without modifying the original error.
  // Using the original error as the prototype allows this wrapped object to look exactly
  // like the original error, except that it has an additional symbol available.
  const wrappedError = error
    ? Object.setPrototypeOf({ [UnhandledErrorContextSymbol]: unhandledErrorContext }, error)
    : error;
  return wrappedError;
}
