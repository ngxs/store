import { ensureStoreMetadata, MetaDataModel, StateClass } from '../internal/internals';
import { META_KEY, META_OPTIONS_KEY, StoreOptions } from '../symbols';
import { StoreValidators } from '../utils/store-validators';

/**
 * Decorates a class with ngxs state information.
 */
export function State<T>(options: StoreOptions<T>) {
  return function(target: StateClass) {
    const meta: MetaDataModel = ensureStoreMetadata(target);
    const targetReference: StateClass = Object.getPrototypeOf(target);
    const inheritanceOptions: Partial<StoreOptions<T>> = target[META_OPTIONS_KEY] || {};
    const { children, defaults, name } = { ...inheritanceOptions, ...options };

    StoreValidators.checkCorrectStateName(name);

    if (targetReference.hasOwnProperty(META_KEY)) {
      const parentMeta: Partial<MetaDataModel> = targetReference[META_KEY] || {};
      meta.actions = { ...meta.actions, ...parentMeta.actions };
    }

    meta.children = children;
    meta.defaults = defaults;
    meta.name = name;

    target[META_OPTIONS_KEY] = options;
  };
}
