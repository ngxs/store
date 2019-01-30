import { ensureStoreMetadata, MetaDataModel, StateClass } from '../internal/internals';
import { META_KEY, META_OPTIONS_KEY, StoreOptions } from '../symbols';
import { StoreValidators } from '../utils/store-validators';

interface MutateMetaOptions<T> {
  meta: MetaDataModel;
  inheritedStateClass: StateClass;
  optionsWithInheritance: StoreOptions<T>;
}

/**
 * Decorates a class with ngxs state information.
 */
export function State<T>(options: StoreOptions<T>) {
  function getStateOptions(inheritedStateClass: StateClass): StoreOptions<T> {
    const inheritanceOptions: Partial<StoreOptions<T>> =
      inheritedStateClass[META_OPTIONS_KEY] || {};
    return { ...inheritanceOptions, ...options } as StoreOptions<T>;
  }

  function mutateMetaData(params: MutateMetaOptions<T>): void {
    const { meta, inheritedStateClass, optionsWithInheritance } = params;
    const { children, defaults, name } = optionsWithInheritance;
    StoreValidators.checkCorrectStateName(name);

    if (inheritedStateClass.hasOwnProperty(META_KEY)) {
      const inheritedMeta: Partial<MetaDataModel> = inheritedStateClass[META_KEY] || {};
      meta.actions = { ...meta.actions, ...inheritedMeta.actions };
    }

    meta.children = children;
    meta.defaults = defaults;
    meta.name = name;
  }

  return (target: StateClass): void => {
    const meta: MetaDataModel = ensureStoreMetadata(target);
    const inheritedStateClass: StateClass = Object.getPrototypeOf(target);
    const optionsWithInheritance: StoreOptions<T> = getStateOptions(inheritedStateClass);
    mutateMetaData({ meta, inheritedStateClass, optionsWithInheritance });
    target[META_OPTIONS_KEY] = optionsWithInheritance;
  };
}
