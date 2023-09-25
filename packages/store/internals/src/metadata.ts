import {
  ɵMETA_KEY,
  ɵSELECTOR_META_KEY,
  ɵMetaDataModel,
  ɵStateClassInternal,
  ɵSelectorMetaDataModel,
  ɵRuntimeSelectorContext
} from './symbols';

/**
 * Ensures metadata is attached to the class and returns it.
 *
 * @ignore
 */
export function ɵensureStoreMetadata(target: ɵStateClassInternal): ɵMetaDataModel {
  if (!target.hasOwnProperty(ɵMETA_KEY)) {
    const defaultMetadata: ɵMetaDataModel = {
      name: null,
      actions: {},
      defaults: {},
      path: null,
      makeRootSelector(context: ɵRuntimeSelectorContext) {
        return context.getStateGetter(defaultMetadata.name);
      },
      children: []
    };

    Object.defineProperty(target, ɵMETA_KEY, { value: defaultMetadata });
  }
  return ɵgetStoreMetadata(target);
}

/**
 * Get the metadata attached to the state class if it exists.
 *
 * @ignore
 */
export function ɵgetStoreMetadata(target: ɵStateClassInternal): ɵMetaDataModel {
  return target[ɵMETA_KEY]!;
}

/**
 * Ensures metadata is attached to the selector and returns it.
 *
 * @ignore
 */
export function ɵensureSelectorMetadata(target: Function): ɵSelectorMetaDataModel {
  if (!target.hasOwnProperty(ɵSELECTOR_META_KEY)) {
    const defaultMetadata: ɵSelectorMetaDataModel = {
      makeRootSelector: null,
      originalFn: null,
      containerClass: null,
      selectorName: null,
      getSelectorOptions: () => ({})
    };

    Object.defineProperty(target, ɵSELECTOR_META_KEY, { value: defaultMetadata });
  }

  return ɵgetSelectorMetadata(target);
}

/**
 * Get the metadata attached to the selector if it exists.
 *
 * @ignore
 */
export function ɵgetSelectorMetadata(target: any): ɵSelectorMetaDataModel {
  return target[ɵSELECTOR_META_KEY];
}
