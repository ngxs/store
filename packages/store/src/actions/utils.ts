/**
 * @public
 * As a continuation #2947 issue, which allows the abstract modifier on method declarations
 * but disallows it on static methods declarations, I suggest to expand this functionality
 * to static methods declarations by allowing abstract static modifier on method declarations.
 * The related problem concerns static modifier on interface methods declaration, which is disallowed.
 * https://github.com/microsoft/TypeScript/issues/14600
 * This decorator does not carry any load on runtime. Only type check on existence static type.
 */
export function RequiredType<T extends {}>(): (constructor: T) => void {
  return (_constructor: T): void => {};
}

/**
 * @private
 */
export function ensureActionType(target: any): string | null {
  const constructor: any = Object.getPrototypeOf(target || {}).constructor || {};
  return constructor.type || null;
}

/**
 * @private
 */
export function runtimeCheckMissingType(target: any): void {
  const type: string | null = ensureActionType(target);
  if (!type) {
    throw new Error('Action type is required');
  }
}
