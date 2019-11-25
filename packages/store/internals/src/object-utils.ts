/**
 * @deprecated will be removed after v4
 */
export namespace ObjectUtils {
  export function merge(a: object, b: object): object {
    return { ...(a || {}), ...(b || {}) };
  }
}
