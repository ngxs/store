/**
 * Returns the type from an action instance/class.
 * @ignore
 */
export function getActionTypeFromInstanceOrClass(action: any): string | undefined {
  if (action.constructor && action.constructor.type) {
    return action.constructor.type;
  }

  return action.type;
}

export function getActionTypeFromClass<T = any>(actionClass: any): string {
  return actionClass.type;
}

/**
 * Matches a action
 * @ignore
 */
export function actionMatcher(action1: any) {
  const type1 = getActionTypeFromInstanceOrClass(action1);

  return function(action2: any) {
    return type1 === getActionTypeFromInstanceOrClass(action2);
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
      acc[part] = Array.isArray(acc[part]) ? [...acc[part]] : { ...acc[part] };
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
