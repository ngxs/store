import { ensureStoreMetadata, MetaDataModel, StateClassInternal } from '../internal/internals';
import { META_KEY, META_OPTIONS_KEY, StoreOptions } from '../symbols';
import { StoreValidators } from '../utils/store-validators';
import { StateClass } from '@ngxs/store/internals';

interface MutateMetaOptions<T> {
  meta: MetaDataModel;
  inheritedStateClass: StateClassInternal;
  optionsWithInheritance: StoreOptions<T>;
}

/**
 * Decorates a class with ngxs state information.
 */
export function State<T>(options: StoreOptions<T>) {
  function getStateOptions(inheritedStateClass: StateClassInternal): StoreOptions<T> {
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
    const stateClass: StateClassInternal = target;
    const meta: MetaDataModel = ensureStoreMetadata(stateClass);
    const inheritedStateClass: StateClassInternal = Object.getPrototypeOf(stateClass);
    const optionsWithInheritance: StoreOptions<T> = getStateOptions(inheritedStateClass);
    mutateMetaData({ meta, inheritedStateClass, optionsWithInheritance });
    stateClass[META_OPTIONS_KEY] = optionsWithInheritance;
  };
}
