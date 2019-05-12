export class ObjectUtils {
  public static merge(a: object, b: object): object {
    return { ...a, ...b };
  }

  public static clone(obj: object): object {
    return JSON.parse(JSON.stringify(obj));
  }
}
