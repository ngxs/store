import {
  ɵStateClass,
  ɵMETA_KEY,
  ɵMETA_OPTIONS_KEY,
  ɵMetaDataModel,
  ɵStateClassInternal,
  ɵStoreOptions,
  ɵensureStoreMetadata
} from '@ngxs/store/internals';

import { ensureStateNameIsValid } from '../utils/store-validators';

interface MutateMetaOptions<T> {
  meta: ɵMetaDataModel;
  inheritedStateClass: ɵStateClassInternal;
  optionsWithInheritance: ɵStoreOptions<T>;
}

/**
 * Decorates a class with ngxs state information.
 */
export function State<T>(options: ɵStoreOptions<T>) {
  return (target: ɵStateClass): void => {
    const stateClass: ɵStateClassInternal = target;
    const meta: ɵMetaDataModel = ɵensureStoreMetadata(stateClass);
    const inheritedStateClass: ɵStateClassInternal = Object.getPrototypeOf(stateClass);
    const optionsWithInheritance: ɵStoreOptions<T> = getStateOptions(
      inheritedStateClass,
      options
    );
    mutateMetaData<T>({ meta, inheritedStateClass, optionsWithInheritance });
    stateClass[ɵMETA_OPTIONS_KEY] = optionsWithInheritance;
  };
}

function getStateOptions<T>(
  inheritedStateClass: ɵStateClassInternal,
  options: ɵStoreOptions<T>
): ɵStoreOptions<T> {
  const inheritanceOptions: Partial<ɵStoreOptions<T>> =
    inheritedStateClass[ɵMETA_OPTIONS_KEY] || {};
  return { ...inheritanceOptions, ...options } as ɵStoreOptions<T>;
}

function mutateMetaData<T>(params: MutateMetaOptions<T>): void {
  const { meta, inheritedStateClass, optionsWithInheritance } = params;
  const { children, defaults, name } = optionsWithInheritance;
  const stateName: string | null =
    typeof name === 'string' ? name : (name && name.getName()) || null;

  if (typeof ngDevMode !== 'undefined' && ngDevMode) {
    ensureStateNameIsValid(stateName);
  }

  if (inheritedStateClass.hasOwnProperty(ɵMETA_KEY)) {
    const inheritedMeta: Partial<ɵMetaDataModel> = inheritedStateClass[ɵMETA_KEY] || {};
    meta.actions = { ...meta.actions, ...inheritedMeta.actions };
  }

  meta.children = children;
  meta.defaults = defaults;
  meta.name = stateName;
}
