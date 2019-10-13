import { ensureSelectorOptions, SharedSelectorOptions } from '../internal/internals';

/**
 * Decorator for setting selector options at a method or class level.
 */
export function SelectorOptions(options: SharedSelectorOptions) {
  return <ClassDecorator & MethodDecorator>(
    function decorate<T>(
      target: any,
      methodName: string,
      descriptor: TypedPropertyDescriptor<T>
    ) {
      if (methodName) {
        // Method Decorator
        const originalFn = descriptor.value || (<any>descriptor).originalFn;
        if (originalFn) {
          ensureSelectorOptions(originalFn, options);
        }
      } else {
        // Class Decorator
        ensureSelectorOptions(target, options);
      }
    }
  );
}
