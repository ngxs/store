function defaultEqualityCheck(a: any, b: any) {
  return a === b;
}

function areArgumentsShallowlyEqual(
  equalityCheck: (a: any, b: any) => boolean,
  prev: IArguments | null,
  next: IArguments | null
) {
  if (prev === null || next === null || prev.length !== next.length) {
    return false;
  }

  // Do this in a for loop (and not a `forEach` or an `every`) so we can determine equality as fast as possible.
  const length = prev.length;
  for (let i = 0; i < length; i++) {
    if (!equalityCheck(prev[i], next[i])) {
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
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  equalityCheck = defaultEqualityCheck
): T {
  let lastArgs: IArguments | null = null;
  let lastResult: any = null;
  // we reference arguments instead of spreading them for performance reasons
  function memoized() {
    if (!areArgumentsShallowlyEqual(equalityCheck, lastArgs, arguments)) {
      // apply arguments instead of spreading for performance.
      lastResult = (<Function>func).apply(null, arguments);
    }

    lastArgs = arguments;
    return lastResult;
  }
  (<any>memoized).reset = function() {
    // The hidden (for now) ability to reset the memoization
    lastArgs = null;
    lastResult = null;
  };
  return memoized as T;
}
