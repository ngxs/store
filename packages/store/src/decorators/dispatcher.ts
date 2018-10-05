import { DispatcherMetaData, ensureStoreMetadata } from '../internal/internals';
import { DISPATCHER_META_KEY } from '../symbols';

/**
 * Decorates a method with a dispatcher information.
 */
export function Dispatcher(options?: Partial<DispatcherMetaData>): MethodDecorator {
  return <T>(target: Function, key: string, descriptor: TypedPropertyDescriptor<T>) => {
    if (typeof descriptor.value !== 'function' || typeof target[key] !== 'function') {
      throw new TypeError(`Only static functions can be decorated with @Dispatcher() decorator`);
    }

    const meta = ensureStoreMetadata(target);
    const type: string = (options && options.type) || `${target.name}.${key}`;

    if (meta.actions[type]) {
      throw new Error(`Method decorated with such type \`${type}\` already exists`);
    }

    meta.actions[type] = [
      {
        fn: `${key}`,
        options: {},
        type
      }
    ];

    descriptor.value[DISPATCHER_META_KEY] = { type };
    target.prototype[key] = function() {
      return target[key].apply(target, arguments);
    };
  };
}
