import {
  SelectFromState,
  fastPropGetter,
  ensureSelectorMetadata,
  getSelectorMetadata,
  getStoreMetadata
} from '../internal/internals';
import { memoize } from '../utils/memoize';

/**
 * Function for creating a selector
 * @param selectors The selectors to use to create the arguments of this function
 * @param originalFn The original function being made into a selector
 */
export function createSelector(
  selectors: any[],
  originalFn: any,
  creationMetadata?: { containerClass: any; selectorName: string }
) {
  const wrappedFn = function wrappedSelectorFn(...args) {
    const returnValue = originalFn(...args);
    if (returnValue instanceof Function) {
      const innerMemoizedFn = memoize.apply(null, [returnValue]);
      return innerMemoizedFn;
    }
    return returnValue;
  };
  const memoizedFn = memoize(wrappedFn);
  const containerClass = creationMetadata && creationMetadata.containerClass;

  const fn = state => {
    const results = [];

    const selectorsToApply = [];

    if (containerClass) {
      // If we are on a state class, add it as the first selector parameter
      const metadata = getStoreMetadata(containerClass);
      if (metadata) {
        selectorsToApply.push(containerClass);
      }
    }
    if (selectors) {
      selectorsToApply.push(...selectors);
    }
    // Determine arguments from the app state using the selectors
    if (selectorsToApply) {
      results.push(...selectorsToApply.map(a => getSelectorFn(a)(state)));
    }

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

  const selectorMetaData = ensureSelectorMetadata(memoizedFn);
  selectorMetaData.originalFn = originalFn;
  selectorMetaData.selectFromAppState = fn;
  if (creationMetadata) {
    selectorMetaData.containerClass = creationMetadata.containerClass;
    selectorMetaData.selectorName = creationMetadata.selectorName;
  }
  return memoizedFn;
}

/**
 * This function gets the selector function to be used to get the selected slice from the app state
 * @ignore
 */
export function getSelectorFn(selector: any): SelectFromState {
  const selectorMetadata = getSelectorMetadata(selector);
  if (selectorMetadata) {
    const selectFromAppState = selectorMetadata.selectFromAppState;
    if (selectFromAppState) {
      return selectFromAppState;
    }
  }
  const stateMetadata = getStoreMetadata(selector);
  if (stateMetadata && stateMetadata.path) {
    return fastPropGetter(stateMetadata.path.split('.'));
  }
  return selector;
}
