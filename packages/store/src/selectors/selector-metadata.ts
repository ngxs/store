import {
  ɵSelectorMetaDataModel,
  ɵSharedSelectorOptions,
  ɵensureSelectorMetadata
} from '@ngxs/store/internals';

import { CreationMetadata } from './selector-models';

const SELECTOR_OPTIONS_META_KEY = 'NGXS_SELECTOR_OPTIONS_META';

export const selectorOptionsMetaAccessor = {
  getOptions: (target: any): ɵSharedSelectorOptions => {
    return (target && (<any>target)[SELECTOR_OPTIONS_META_KEY]) || {};
  },
  defineOptions: (target: any, options: ɵSharedSelectorOptions) => {
    if (!target) return;
    (<any>target)[SELECTOR_OPTIONS_META_KEY] = options;
  }
};

export function setupSelectorMetadata<T extends (...args: any[]) => any>(
  originalFn: T,
  creationMetadata: Partial<CreationMetadata> | undefined
) {
  const selectorMetaData = ɵensureSelectorMetadata(originalFn);
  selectorMetaData.originalFn = originalFn;
  let getExplicitSelectorOptions = () => ({});
  if (creationMetadata) {
    selectorMetaData.containerClass = creationMetadata.containerClass;
    selectorMetaData.selectorName = creationMetadata.selectorName || null;
    getExplicitSelectorOptions =
      creationMetadata.getSelectorOptions || getExplicitSelectorOptions;
  }
  const selectorMetaDataClone = { ...selectorMetaData };
  selectorMetaData.getSelectorOptions = () =>
    getLocalSelectorOptions(selectorMetaDataClone, getExplicitSelectorOptions());
  return selectorMetaData;
}

function getLocalSelectorOptions(
  selectorMetaData: ɵSelectorMetaDataModel,
  explicitOptions: ɵSharedSelectorOptions
): ɵSharedSelectorOptions {
  return {
    ...(selectorOptionsMetaAccessor.getOptions(selectorMetaData.containerClass) || {}),
    ...(selectorOptionsMetaAccessor.getOptions(selectorMetaData.originalFn) || {}),
    ...(selectorMetaData.getSelectorOptions() || {}),
    ...explicitOptions
  };
}
