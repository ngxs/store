import {
  ensureStoreMetadata,
  MetaDataModel,
  MutateMetaOptions,
  StateClass
} from '../internal/internals';
import { META_KEY, META_OPTIONS_KEY, StoreOptions } from '../symbols';
import { StoreValidators } from '../utils/store-validators';

/**
 * Decorates a class with ngxs state information.
 */
export function State<T>(options: StoreOptions<T>) {
  function mutateMetaData({
    meta,
    stateClass,
    optionsWithInheritance
  }: MutateMetaOptions<T>): void {
    const { children, defaults, name } = optionsWithInheritance;
    StoreValidators.checkCorrectStateName(name);

    if (stateClass.hasOwnProperty(META_KEY)) {
      const parentMeta: Partial<MetaDataModel> = stateClass[META_KEY] || {};
      meta.actions = { ...meta.actions, ...parentMeta.actions };
    }

    meta.children = children;
    meta.defaults = defaults;
    meta.name = name;
  }

  return (target: StateClass): void => {
    const meta: MetaDataModel = ensureStoreMetadata(target);
    const stateClass: StateClass = Object.getPrototypeOf(target);
    const inheritanceOptions: Partial<StoreOptions<T>> = stateClass[META_OPTIONS_KEY] || {};
    const optionsWithInheritance: StoreOptions<T> = { ...inheritanceOptions, ...options };
    mutateMetaData({ meta, stateClass, optionsWithInheritance });
    target[META_OPTIONS_KEY] = optionsWithInheritance;
  };
}
