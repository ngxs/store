import { ɵdefineProperty, ɵhasOwnProperty } from './object-utils';
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
  if (!ɵhasOwnProperty(target, ɵMETA_KEY)) {
    const defaultMetadata: ɵMetaDataModel = {
      name: null,
      actions: Object.create(null),
      defaults: {},
      path: null,
      makeRootSelector(context: ɵRuntimeSelectorContext) {
        return context.getStateGetter(defaultMetadata.name);
      },
      children: []
    };

    ɵdefineProperty(target, ɵMETA_KEY, { value: defaultMetadata });
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
  if (!ɵhasOwnProperty(target, ɵSELECTOR_META_KEY)) {
    const defaultMetadata: ɵSelectorMetaDataModel = {
      makeRootSelector: null,
      originalFn: null,
      containerClass: null,
      selectorName: null,
      getSelectorOptions: () => ({})
    };

    ɵdefineProperty(target, ɵSELECTOR_META_KEY, { value: defaultMetadata });
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
