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
