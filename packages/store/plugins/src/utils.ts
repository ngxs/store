// Resolved `type` string keyed by the action *class*. This exists to defuse a
// V8 inline-cache (IC) problem, not just to save a property read.
//
// `getActionTypeFromInstance` is one of the hottest functions in NGXS: it runs
// several times per dispatch, and once per `ofAction*` / `actionMatcher`
// subscriber for every action that passes through the actions stream. Its two
// reads below - `action.constructor` and `<class>.type` - happen at a single
// call site that sees a different object shape ("hidden class" / Map, in V8
// terms) for every action class in the app.
//
// V8 attaches an IC to each property-access site. It stays fast while the site
// has seen 1 shape (monomorphic) or up to 4 (polymorphic). Beyond that the site
// goes *megamorphic*: V8 discards the per-site cache, every hit becomes a
// generic lookup through the global megamorphic stub cache (and a full runtime
// walk on a miss), and TurboFan can no longer inline or speculate on that read.
// An app with more than four action classes - i.e. essentially all of them -
// pushes both reads here permanently into that state.
//
// Keying a WeakMap by the constructor collapses the steady state to: one
// `action.constructor` load (still shape-varied - unavoidable, we need the
// class to key on) plus one `WeakMap.prototype.get`, a builtin with flat,
// predictable cost. The megamorphic `<class>.type` static-field load is skipped
// entirely for every class already seen. WeakMap rather than Map so
// lazily-loaded / retired action classes stay collectable.
const actionTypeCache = new WeakMap<Function, string>();

/**
 * Returns the type from an action instance/class.
 * @ignore
 */
export function getActionTypeFromInstance(action: any): string | undefined {
  // The one shape-varied ("megamorphic") load we can't avoid: we need the class
  // itself to key the cache. Everything below is arranged so this is the only
  // such read on the warm path.
  const actionClass = action.constructor;

  if (actionClass) {
    // `get(...) !== undefined` instead of `has(...)` then `get(...)` - one probe
    // into the WeakMap, not two, on the path that runs for every known action.
    const cachedType = actionTypeCache.get(actionClass);
    if (cachedType !== undefined) {
      return cachedType;
    }

    // Cold path, runs at most once per action class. `actionClass.type` is the
    // megamorphic static-field load the cache above is here to stop repeating -
    // `type` is an own property of each constructor function, so this read sees
    // a fresh shape for every action class.
    const type = actionClass.type;
    if (type) {
      actionTypeCache.set(actionClass, type);
      return type;
    }
  }

  // Fallback for plain-object actions (`{ type: '...' }`) with no meaningful
  // constructor - can't be cached by class, but these are rare on the hot path.
  return action.type;
}

/**
 * Matches a action
 * @ignore
 */
export function actionMatcher(action1: any) {
  const type1 = getActionTypeFromInstance(action1);

  return function (action2: any) {
    return type1 === getActionTypeFromInstance(action2);
  };
}

/**
 * Set a deeply nested value. Example:
 *
 *   setValue({ foo: { bar: { eat: false } } },
 *      'foo.bar.eat', true) //=> { foo: { bar: { eat: true } } }
 *
 * While it traverses it also creates new objects from top down.
 *
 * @ignore
 */
export const setValue = (obj: any, prop: string, val: any) => {
  // Most state paths are a single segment (top-level state, no nesting).
  // Skip `split`/`reduce` for that common case since it's just a shallow copy + assignment.
  if (prop.indexOf('.') === -1) {
    return { ...obj, [prop]: val };
  }

  obj = { ...obj };

  const split = prop.split('.');
  const lastIndex = split.length - 1;

  split.reduce((acc, part, index) => {
    if (index === lastIndex) {
      acc[part] = val;
    } else {
      acc[part] = Array.isArray(acc[part]) ? acc[part].slice() : { ...acc[part] };
    }

    return acc?.[part];
  }, obj);

  return obj;
};

/**
 * Get a deeply nested value. Example:
 *
 *    getValue({ foo: bar: [] }, 'foo.bar') //=> []
 *
 * @ignore
 */
export const getValue = (obj: any, prop: string): any => {
  if (prop.indexOf('.') === -1) return obj?.[prop];

  return prop.split('.').reduce((acc: any, part: string) => acc?.[part], obj);
};
