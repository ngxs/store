import { memoize } from '@ngxs/store/internals';

import {
  ensureSelectorMetadata,
  getSelectorMetadata,
  getStoreMetadata,
  globalSelectorOptions,
  SelectFromState,
  SelectorMetaDataModel,
  SharedSelectorOptions
} from '../internal/internals';

const SELECTOR_OPTIONS_META_KEY = 'NGXS_SELECTOR_OPTIONS_META';

export const selectorOptionsMetaAccessor = {
  getOptions: (target: any): SharedSelectorOptions => {
    return (target && (<any>target)[SELECTOR_OPTIONS_META_KEY]) || {};
  },
  defineOptions: (target: any, options: SharedSelectorOptions) => {
    if (!target) return;
    (<any>target)[SELECTOR_OPTIONS_META_KEY] = options;
  }
};

type CreationMetadata = {
  containerClass: any;
  selectorName: string;
  getSelectorOptions?: () => SharedSelectorOptions;
};

type RuntimeSelectorInfo = {
  selectorOptions: SharedSelectorOptions;
  argumentSelectorFunctions: ((state: any) => any)[];
};

/**
 * Function for creating a selector
 * @param selectors The selectors to use to create the arguments of this function
 * @param originalFn The original function being made into a selector
 * @param creationMetadata
 */
export function createSelector<T extends (...args: any[]) => any>(
  selectors: any[] | undefined,
  originalFn: T,
  creationMetadata?: CreationMetadata
) {
  const containerClass = creationMetadata && creationMetadata.containerClass;
  const wrappedFn = function wrappedSelectorFn(...args: any[]) {
    const returnValue = originalFn.apply(containerClass, args);
    if (returnValue instanceof Function) {
      const innerMemoizedFn = memoize.apply(null, [returnValue]);
      return innerMemoizedFn;
    }
    return returnValue;
  } as T;
  const memoizedFn = memoize(wrappedFn);
  const selectorMetaData = setupSelectorMetadata<T>(memoizedFn, originalFn, creationMetadata);
  let runtimeInfo: RuntimeSelectorInfo;

  const selectFromAppState = (state: any) => {
    const results = [];

    runtimeInfo = runtimeInfo || getRuntimeSelectorInfo(selectorMetaData, selectors);
    const { suppressErrors } = runtimeInfo.selectorOptions;
    const { argumentSelectorFunctions } = runtimeInfo;

    // Determine arguments from the app state using the selectors
    results.push(...argumentSelectorFunctions.map(argFn => argFn(state)));

    // if the lambda tries to access a something on the
    // state that doesn't exist, it will throw a TypeError.
    // since this is quite usual behaviour, we simply return undefined if so.
    try {
      return memoizedFn(...results);
    } catch (ex) {
      if (ex instanceof TypeError && suppressErrors) {
        return undefined;
      }

      throw ex;
    }
  };

  selectorMetaData.selectFromAppState = selectFromAppState;

  return memoizedFn;
}

function setupSelectorMetadata<T extends (...args: any[]) => any>(
  memoizedFn: T,
  originalFn: T,
  creationMetadata: CreationMetadata | undefined
) {
  const selectorMetaData = ensureSelectorMetadata(memoizedFn);
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
    getCustomSelectorOptions(selectorMetaDataClone, getExplicitSelectorOptions());
  return selectorMetaData;
}

function getRuntimeSelectorInfo(
  selectorMetaData: SelectorMetaDataModel,
  selectors: any[] | undefined = []
): RuntimeSelectorInfo {
  const selectorOptions = selectorMetaData.getSelectorOptions();
  const selectorsToApply = getSelectorsToApply(selectorMetaData, selectors);
  const argumentSelectorFunctions = selectorsToApply.map(selector => getSelectorFn(selector));
  return {
    selectorOptions,
    argumentSelectorFunctions
  };
}

function getCustomSelectorOptions(
  selectorMetaData: SelectorMetaDataModel,
  explicitOptions: SharedSelectorOptions
): SharedSelectorOptions {
  const selectorOptions: SharedSelectorOptions = {
    ...globalSelectorOptions.get(),
    ...(selectorOptionsMetaAccessor.getOptions(selectorMetaData.containerClass) || {}),
    ...(selectorOptionsMetaAccessor.getOptions(selectorMetaData.originalFn) || {}),
    ...(selectorMetaData.getSelectorOptions() || {}),
    ...explicitOptions
  };

  return selectorOptions;
}

function getSelectorsToApply(
  selectorMetaData: SelectorMetaDataModel,
  selectors: any[] | undefined = []
) {
  const selectorsToApply = [];
  const canInjectContainerState =
    selectors.length === 0 || selectorMetaData.getSelectorOptions().injectContainerState;
  const containerClass = selectorMetaData.containerClass;
  if (containerClass && canInjectContainerState) {
    // If we are on a state class, add it as the first selector parameter
    const metadata = getStoreMetadata(containerClass);
    if (metadata) {
      selectorsToApply.push(containerClass);
    }
  }
  if (selectors) {
    selectorsToApply.push(...selectors);
  }
  return selectorsToApply;
}

/**
 * This function gets the selector function to be used to get the selected slice from the app state
 * @ignore
 */
export function getSelectorFn(selector: any): SelectFromState {
  const metadata = getSelectorMetadata(selector) || getStoreMetadata(selector);
  return (metadata && metadata.selectFromAppState) || selector;
}
