import {
  ɵStateClass,
  ɵMETA_KEY,
  ɵMETA_OPTIONS_KEY,
  ɵMetaDataModel,
  ɵStateClassInternal,
  ɵStoreOptions,
  ɵensureStoreMetadata,
  ɵhasOwnProperty,
  StateToken,
  ɵTokenName
} from '@ngxs/store/internals';

import { ensureStateNameIsValid } from '../utils/store-validators';

/**
 * Decorates a class with ngxs state information.
 */
export function State<T>(options: ɵStoreOptions<T>) {
  return (target: ɵStateClass): void => {
    const stateClass: ɵStateClassInternal = target;
    const inherited = Object.getPrototypeOf(stateClass) as ɵStateClassInternal;
    const meta = ɵensureStoreMetadata(stateClass);
    const mergedOptions = { ...(inherited[ɵMETA_OPTIONS_KEY] || {}), ...options };

    // Apply merged options to metadata.
    mutateMetaData(meta, inherited, mergedOptions);
    stateClass[ɵMETA_OPTIONS_KEY] = mergedOptions;
  };
}

// Updates metadata using inherited and current options
function mutateMetaData<T>(
  meta: ɵMetaDataModel,
  inherited: ɵStateClassInternal,
  options: ɵStoreOptions<T>
): void {
  const { name, defaults, children } = options;
  const stateName = typeof name === 'string' ? name : name?.getName?.() || null;
  const stateToken =
    typeof name === 'string' ? new StateToken<T>(name as ɵTokenName<T>) : name;

  if (typeof ngDevMode !== 'undefined' && ngDevMode) {
    ensureStateNameIsValid(stateName);
  }

  if (ɵhasOwnProperty(inherited, ɵMETA_KEY)) {
    const inheritedMeta = inherited[ɵMETA_KEY] || <ɵMetaDataModel>{};
    meta.actions = { ...meta.actions, ...inheritedMeta.actions };
  }

  meta.name = stateName as string;
  meta.token = stateToken;
  meta.defaults = defaults;
  meta.children = children;
}
