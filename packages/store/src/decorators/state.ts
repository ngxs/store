import { StateClass } from '@ngxs/store/internals';

import { ensureStateNameIsValid } from '../utils/store-validators';
import { META_KEY, META_OPTIONS_KEY, StoreOptions } from '../symbols';
import { ensureStoreMetadata, MetaDataModel, StateClassInternal } from '../internal/internals';

interface MutateMetaOptions<T> {
  meta: MetaDataModel;
  inheritedStateClass: StateClassInternal;
  optionsWithInheritance: StoreOptions<T>;
}

/**
 * Decorates a class with ngxs state information.
 */
export function State<T>(options: StoreOptions<T>) {
  return (target: StateClass): void => {
    const stateClass: StateClassInternal = target;
    const meta: MetaDataModel = ensureStoreMetadata(stateClass);
    const inheritedStateClass: StateClassInternal = Object.getPrototypeOf(stateClass);
    const optionsWithInheritance: StoreOptions<T> = getStateOptions(
      inheritedStateClass,
      options
    );
    mutateMetaData<T>({ meta, inheritedStateClass, optionsWithInheritance });
    stateClass[META_OPTIONS_KEY] = optionsWithInheritance;
  };
}

function getStateOptions<T>(
  inheritedStateClass: StateClassInternal,
  options: StoreOptions<T>
): StoreOptions<T> {
  const inheritanceOptions: Partial<StoreOptions<T>> =
    inheritedStateClass[META_OPTIONS_KEY] || {};
  return { ...inheritanceOptions, ...options } as StoreOptions<T>;
}

function mutateMetaData<T>(params: MutateMetaOptions<T>): void {
  const { meta, inheritedStateClass, optionsWithInheritance } = params;
  const { children, defaults, name } = optionsWithInheritance;
  const stateName: string | null =
    typeof name === 'string' ? name : (name && name.getName()) || null;

  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    ensureStateNameIsValid(stateName);
  }

  if (inheritedStateClass.hasOwnProperty(META_KEY)) {
    const inheritedMeta: Partial<MetaDataModel> = inheritedStateClass[META_KEY] || {};
    meta.actions = { ...meta.actions, ...inheritedMeta.actions };
  }

  meta.children = children;
  meta.defaults = defaults;
  meta.name = stateName;
}
