export namespace ObjectUtils {
  export function merge(a: object, b: object): object {
    return { ...a, ...b };
  }

  export function clone(obj: object): object {
    return JSON.parse(JSON.stringify(obj));
  }
}
