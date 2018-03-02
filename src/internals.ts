import { META_KEY } from './symbols';

export function ensureStoreMetadata(target) {
  if (!target.hasOwnProperty(META_KEY)) {
    const defaultMetadata = {
      mutations: {},
      actions: {},
      defaults: {}
    };
    Object.defineProperty(target, META_KEY, { value: defaultMetadata });
  }
  return target[META_KEY];
}

/**
 * The generated function is faster than:
 * - pluck (Observable operator)
 * - memoize (old ngrx-actions implementation)
 * - MemoizedSelector (ngrx)
 */
export function fastPropGetter(paths: string[]): (x: any) => any {
  const segments = paths;
  let seg = 'store.' + segments[0];
  let i = 0;
  const l = segments.length;

  let expr = seg;
  while (++i < l) {
    expr = expr + ' && ' + (seg = seg + '.' + segments[i]);
  }

  const fn = new Function('store', 'return ' + expr + ';');

  return <(x: any) => any>fn;
}
