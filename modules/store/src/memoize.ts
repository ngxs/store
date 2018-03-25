/**
 * Memoize a function.
 * Oringinally from: https://github.com/lodash/lodash/blob/master/memoize.js with some modifications
 */
export function memoize(func, resolver?) {
  const memoized: any = function(...args) {
    const key = resolver ? resolver.apply(this, args) : args[0];
    const cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };

  memoized.cache = new WeakMap();

  return memoized;
}
