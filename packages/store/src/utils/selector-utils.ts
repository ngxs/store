import { memoize } from '@ngxs/store/internals';

import {
  SelectFromState,
  ensureSelectorMetadata,
  getSelectorMetadata,
  getStoreMetadata,
  SelectorMetaDataModel,
  InternalSelectorOptions
} from '../internal/internals';

/**
 * Function for creating a selector
 * @param selectors The selectors to use to create the arguments of this function
 * @param originalFn The original function being made into a selector
 * @param creationMetadata
 */
export function createSelector<T extends (...args: any[]) => any>(
  selectors: any[] | undefined,
  originalFn: T,
  creationMetadata?: { containerClass: any; selectorName: string }
) {
  const wrappedFn = function wrappedSelectorFn(...args: any[]) {
    const returnValue = originalFn(...args);
    if (returnValue instanceof Function) {
      const innerMemoizedFn = memoize.apply(null, [returnValue]);
      return innerMemoizedFn;
    }
    return returnValue;
  } as T;
  const memoizedFn = memoize(wrappedFn);
  const selectorMetaData = ensureSelectorMetadata(memoizedFn);
  selectorMetaData.originalFn = originalFn;

  if (creationMetadata) {
    selectorMetaData.containerClass = creationMetadata.containerClass;
    selectorMetaData.selectorName = creationMetadata.selectorName;
  }

  selectorMetaData.selectorOptions = getCustomSelectorOptions(selectorMetaData, {});

  const fn = (state: any) => {
    const results = [];

    const selectorsToApply = getSelectorsToApply(selectorMetaData, selectors);

    // Determine arguments from the app state using the selectors
    results.push(...selectorsToApply.map(a => getSelectorFn(a)(state)));

    // if the lambda tries to access a something on the
    // state that doesn't exist, it will throw a TypeError.
    // since this is quite usual behaviour, we simply return undefined if so.
    try {
      return memoizedFn(...results);
    } catch (ex) {
      if (ex instanceof TypeError) {
        return undefined;
      }
      throw ex;
    }
  };

  selectorMetaData.selectFromAppState = fn;

  return memoizedFn;
}

function getCustomSelectorOptions(
  selectorMetaData: SelectorMetaDataModel,
  explicitOptions: InternalSelectorOptions
) {
  let selectorOptions = selectorMetaData.selectorOptions || {};
  const containerClass = selectorMetaData.containerClass;
  if (containerClass) {
    const storeMetaData = getStoreMetadata(containerClass);
    const classSelectorOptions: InternalSelectorOptions =
      (storeMetaData && storeMetaData.internalSelectorOptions) || {};
    selectorOptions = { ...selectorOptions, ...classSelectorOptions };
  }
  selectorOptions = { ...selectorOptions, ...explicitOptions };
  return selectorOptions;
}

function getSelectorsToApply(
  selectorMetaData: SelectorMetaDataModel,
  selectors: any[] | undefined = []
) {
  const selectorsToApply = [];
  const canInjectContainerState =
    selectors.length === 0 || selectorMetaData.selectorOptions.injectContainerState;
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
