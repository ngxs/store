import { SharedSelectorOptions } from '../internal/internals';
import { selectorOptionsMetaAccessor } from '../utils/selector-utils';

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
        if (descriptor.value) {
          const originalFn = descriptor.value;
          selectorOptionsMetaAccessor.defineOptions(originalFn, options);
        }
      } else {
        // Class Decorator
        selectorOptionsMetaAccessor.defineOptions(target, options);
      }
    }
  );
}
