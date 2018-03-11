/**
 * Set a deeply nested value
 */
export const setValue = (obj, prop: string, val) => {
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
 * Get a deeply nested value
 */
export const getValue = (obj, prop: string) => prop.split('.').reduce((acc, part) => acc && acc[part], obj);

/**
 * Default serialize function
 */
export function serialize(val: any) {
  return JSON.stringify(val);
}

/**
 * Default deserialize function
 */
export function deserialize(val: any) {
  return JSON.parse(val);
}
