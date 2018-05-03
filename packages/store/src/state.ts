import { ensureStoreMetadata } from './internals';
import { StoreOptions, META_KEY } from './symbols';

const stateNameRegex = new RegExp('^[a-zA-Z0-9]+$');

/**
 * Error message
 * @ignore
 */
export const stateNameErrorMessage = name =>
  `${name} is not a valid state name. It needs to be a valid object property name.`;

/**
 * Decorates a class with ngxs state information.
 */
export function State<T>(options: StoreOptions<T>) {
  return function(target: any) {
    const meta = ensureStoreMetadata(target);
    // Handle inheritance
    if (Object.getPrototypeOf(target).hasOwnProperty(META_KEY)) {
      const parentMeta = Object.getPrototypeOf(target)[META_KEY];

      meta.actions = {
        ...meta.actions,
        ...parentMeta.actions
      };
    }

    meta.children = options.children;
    meta.defaults = options.defaults;
    meta.name = options.name;

    if (!options.name) {
      throw new Error(`States must register a 'name' property`);
    }

    if (!stateNameRegex.test(options.name)) {
      throw new Error(stateNameErrorMessage(options.name));
    }
  };
}
