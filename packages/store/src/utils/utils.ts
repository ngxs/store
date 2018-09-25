/**
 * Returns the type from an action instance.
 * @ignore
 */
export function getActionTypeFromInstance(action: any): string {
  if (action.constructor && action.constructor.type) {
    return action.constructor.type;
  }

  return action.type;
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
 * Returns the type from an action instance.
 * @ignore
 */
export function getActionTypeFromInstance(action: any): string {
  if (action.constructor && action.constructor.type) {
    return action.constructor.type;
  }

  return action.type;
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
 *   setValue({ foo: { bar: [ true, false ] } },
 *      'foo.bar[1]', true) //=> { foo: { bar: [true, true ] } }
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
    const isArrayMatch = part.match(/^(.*)\[(\d+)\]$/);
    if (isArrayMatch) {
      if (index === lastIndex) {
        acc[isArrayMatch[1]][isArrayMatch[2]] = val;
      } else {
        acc[isArrayMatch[1]][isArrayMatch[2]] = { ...acc[isArrayMatch[1]][isArrayMatch[2]] };
      }
      return acc && acc[isArrayMatch[1]][isArrayMatch[2]];
    } else {
      if (index === lastIndex) {
        acc[part] = val;
      } else {
        acc[part] = { ...acc[part] };
      }
      return acc && acc[part];
    }
  }, obj);

  return obj;
};

/**
 * Get a deeply nested value. Example:
 *
 *    getValue({ foo: bar: [false, true] }, 'foo.bar[1]') //=> true
 *
 * @ignore
 */
export const getValue = (obj: any, prop: string) =>
prop.split('.').reduce((acc: any, part: string) => {
  const isArrayMatch = part.match(/^(.*)\[(\d+)\]$/);
  if (isArrayMatch) {
    return acc[isArrayMatch[1]][isArrayMatch[2]];
  }
  return acc && acc[part];
}, obj);

