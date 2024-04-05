import { ɵSharedSelectorOptions } from '@ngxs/store/internals';

import { selectorOptionsMetaAccessor } from '../selectors/selector-metadata';

/**
 * Decorator for setting selector options at a method or class level.
 */
export function SelectorOptions(options: ɵSharedSelectorOptions) {
  return <ClassDecorator & MethodDecorator>(
    function decorate<T>(
      target: any,
      methodName: string,
      descriptor: TypedPropertyDescriptor<T>
    ) {
      if (methodName) {
        descriptor ||= Object.getOwnPropertyDescriptor(target, methodName)!;
        // Method Decorator
        const originalFn = descriptor.value || (<any>descriptor).originalFn;
        if (originalFn) {
          selectorOptionsMetaAccessor.defineOptions(originalFn, options);
        }
      } else {
        // Class Decorator
        selectorOptionsMetaAccessor.defineOptions(target, options);
      }
    }
  );
}
