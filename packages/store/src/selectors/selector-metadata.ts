import {
  ensureSelectorMetadata,
  SelectorMetaDataModel,
  SharedSelectorOptions,
} from '../internal/internals';
import { CreationMetadata } from './selector-models';

const SELECTOR_OPTIONS_META_KEY = 'NGXS_SELECTOR_OPTIONS_META';

export const selectorOptionsMetaAccessor = {
  getOptions: (target: any): SharedSelectorOptions => {
    return (target && (<any>target)[SELECTOR_OPTIONS_META_KEY]) || {};
  },
  defineOptions: (target: any, options: SharedSelectorOptions) => {
    if (!target) return;
    (<any>target)[SELECTOR_OPTIONS_META_KEY] = options;
  },
};

export function setupSelectorMetadata<T extends (...args: any[]) => any>(
  originalFn: T,
  creationMetadata: CreationMetadata | undefined
) {
  const selectorMetaData = ensureSelectorMetadata(originalFn);
  selectorMetaData.originalFn = originalFn;
  let getExplicitSelectorOptions = () => ({});
  if (creationMetadata) {
    selectorMetaData.containerClass = creationMetadata.containerClass;
    selectorMetaData.selectorName = creationMetadata.selectorName;
    getExplicitSelectorOptions =
      creationMetadata.getSelectorOptions || getExplicitSelectorOptions;
  }
  const selectorMetaDataClone = { ...selectorMetaData };
  selectorMetaData.getSelectorOptions = () =>
    getLocalSelectorOptions(selectorMetaDataClone, getExplicitSelectorOptions());
  return selectorMetaData;
}

function getLocalSelectorOptions(
  selectorMetaData: SelectorMetaDataModel,
  explicitOptions: SharedSelectorOptions
): SharedSelectorOptions {
  return {
    ...(selectorOptionsMetaAccessor.getOptions(selectorMetaData.containerClass) || {}),
    ...(selectorOptionsMetaAccessor.getOptions(selectorMetaData.originalFn) || {}),
    ...(selectorMetaData.getSelectorOptions() || {}),
    ...explicitOptions,
  };
}
