/**
 * Returns the type from a event instance.
 */
export function getActionTypeFromInstance(event) {
  if (event.constructor.type) {
    return event.constructor.type;
  } else if (event.constructor.name) {
    return event.constructor.name;
  } else if (event.type) {
    // events from dev tools are plain objects
    return event.type;
  }
}

/**
 * Set a deeply nested value. Example:
 *
 *   setValue({ foo: { bar: { eat: false } } },
 *      'foo.bar.eat', true) //=> { foo: { bar: { eat: true } } }
 *
 * While it traverses it also creates new objects from top down.
 */
export const setValue = (obj: any, prop: string, val: any) => {
  obj = { ...obj };

  const split = prop.split('.');
  const last = split[split.length - 1];

  split.reduce((acc, part) => {
    if (part === last) {
      acc[part] = val;
    } else {
      acc[part] = { ...acc[part] };
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
 */
export const getValue = (obj: any, prop: string) =>
  prop && prop.split('.').reduce((acc: any, part: string) => acc && acc[part], obj);
