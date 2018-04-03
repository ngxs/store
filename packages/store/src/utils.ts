import { ActionToken } from './action';
/**
 * Returns the type from a event instance.
 */
export function getActionTypeFromInstance(action: any): ActionToken | string {
  if (action.constructor.type) {
    if (action.constructor.type.desc) {
      return action.constructor.type as ActionToken;
    }

    return action.constructor.type as string;
  } else if (action.type) {
    // events from dev tools are plain objects
    return action.type;
  }
}

export function getActionNameFromInstance(action: any): string {
  const type = getActionTypeFromInstance(action);

  if (typeof type === 'string') {
    return type;
  }

  return (type as ActionToken).desc;
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
  prop.split('.').reduce((acc: any, part: string) => acc && acc[part], obj);
