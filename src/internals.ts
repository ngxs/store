import { META_KEY } from './symbols';

export interface MetaDataModel {
  actions: any;
  defaults: any;
}
/**
 * Ensures metadata is attached to the klass and returns it
 */
export function ensureStoreMetadata(target) {
  if (!target.hasOwnProperty(META_KEY)) {
    const defaultMetadata: MetaDataModel = {
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

/**
 * Returns the type from a event class
 */
export function getTypeFromKlass(event) {
  if (event.type) {
    return event.type;
  } else if (event.name) {
    return event.name;
  }
}

/**
 * Returns the type from a event instance
 */
export function getTypeFromInstance(event) {
  if (event.constructor.type) {
    return event.constructor.type;
  } else if (event.constructor.name) {
    return event.constructor.name;
  } else if (event.type) {
    // events from dev tools are plain objects
    return event.type;
  }
}
