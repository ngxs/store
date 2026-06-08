function areArgumentsShallowlyEqual(prev: IArguments | null, next: IArguments | null) {
  if (prev === null || next === null || prev.length !== next.length) {
    return false;
  }

  // Do this in a for loop (and not a `forEach` or an `every`) so we can
  // determine equality as fast as possible.
  const length = prev.length;
  for (let i = 0; i < length; i++) {
    if (!Object.is(prev[i], next[i])) {
      return false;
    }
  }

  return true;
}

/**
 * Memoize a function on its last inputs only.
 * Originally from: https://github.com/reduxjs/reselect/blob/master/src/index.js
 *
 * @ignore
 */
export function ɵmemoize<T extends (...args: any[]) => any>(fn: T, originalFn?: T): T {
  let lastArgs: IArguments | null = null;
  let lastResult: any = null;
  // we reference arguments instead of spreading them for performance reasons
  function memoized() {
    // eslint-disable-next-line prefer-rest-params
    if (!areArgumentsShallowlyEqual(lastArgs, arguments)) {
      // apply arguments instead of spreading for performance.
      // eslint-disable-next-line prefer-rest-params, prefer-spread
      lastResult = (<Function>fn).apply(null, arguments);
    }
    // eslint-disable-next-line prefer-rest-params
    lastArgs = arguments;
    return lastResult;
  }
  if (typeof ngDevMode !== 'undefined' && ngDevMode) {
    (<any>memoized).reset = function () {
      // The hidden (for now) ability to reset the memoization
      lastArgs = null;
      lastResult = null;
    };
    (<any>memoized).originalFn = originalFn ?? fn;
  }
  return memoized as T;
}
