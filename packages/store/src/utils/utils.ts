/**
 * Returns the type from an action instance/class.
 * @ignore
 */
export function getActionTypeFromInstance(action: any): string | undefined {
  if (action.constructor && action.constructor.type) {
    return action.constructor.type;
  } else {
    return action.type;
  }
}

/**
 * Matches a action
 * @ignore
 */
export function actionMatcher(action1: any) {
  const type1 = getActionTypeFromInstance(action1);

  return function(action2: any) {
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
  obj = { ...obj };

  const split = prop.split('.');
  const lastIndex = split.length - 1;

  split.reduce((acc, part, index) => {
    if (index === lastIndex) {
      acc[part] = val;
    } else {
      acc[part] = Array.isArray(acc[part]) ? acc[part].slice() : { ...acc[part] };
    }

    return acc && acc[part];
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
export const getValue = (obj: any, prop: string): any =>
  prop.split('.').reduce((acc: any, part: string) => acc && acc[part], obj);

/**
 * Simple object check.
 *
 *    isObject({a:1}) //=> true
 *    isObject(1) //=> false
 *
 * @ignore
 */
export const isObject = (item: any) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

/**
 * Deep merge two objects.
 *
 *    mergeDeep({a:1, b:{x: 1, y:2}}, {b:{x: 3}, c:4}) //=> {a:1, b:{x:3, y:2}, c:4}
 *
 * @param base base object onto which `sources` will be applied
 */
export const mergeDeep = (base: any, ...sources: any[]): any => {
  if (!sources.length) return base;
  const source = sources.shift();

  if (isObject(base) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!base[key]) Object.assign(base, { [key]: {} });
        mergeDeep(base[key], source[key]);
      } else {
        Object.assign(base, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(base, ...sources);
};
