import {
  ɵActionHandlerMetaData,
  ɵMetaDataModel,
  ɵPlainObjectOf,
  ɵSelectorMetaDataModel,
  ɵStateClassInternal,
  ɵSharedSelectorOptions,
  ɵgetSelectorMetadata,
  ɵgetStoreMetadata,
  ɵensureStoreMetadata,
  ɵensureSelectorMetadata
} from '@ngxs/store/internals';

/**
 * @deprecated will be removed after v4
 */
export type StateClassInternal = ɵStateClassInternal;
/**
 * @deprecated will be removed after v4
 */
export type PlainObjectOf<T> = ɵPlainObjectOf<T>;
/**
 * @deprecated will be removed after v4
 */
export type ActionHandlerMetaData = ɵActionHandlerMetaData;
/**
 * @deprecated will be removed after v4
 */
export type SharedSelectorOptions = ɵSharedSelectorOptions;

/**
 * @deprecated will be removed after v4
 */
export function ensureStoreMetadata(target: ɵStateClassInternal<any, any>): ɵMetaDataModel {
  return ɵensureStoreMetadata(target);
}

/**
 * @deprecated will be removed after v4
 */
export function getStoreMetadata(target: ɵStateClassInternal<any, any>): ɵMetaDataModel {
  return ɵgetStoreMetadata(target);
}

/**
 * @deprecated will be removed after v4
 */
export function ensureSelectorMetadata(target: Function): ɵSelectorMetaDataModel {
  return ɵensureSelectorMetadata(target);
}

/**
 * @deprecated will be removed after v4
 */
export function getSelectorMetadata(target: any): ɵSelectorMetaDataModel {
  return ɵgetSelectorMetadata(target);
}
