import { memoize } from '@ngxs/store/internals';

import {
  ensureSelectorMetadata,
  getSelectorMetadata,
  getSelectorOptions,
  getStoreMetadata,
  globalSelectorOptions,
  SelectFromState,
  SelectorMetaDataModel,
  SharedSelectorOptions,
  StateClassInternal
} from '../internal/internals';

interface CreationMetadata {
  containerClass: any;
  selectorName: string;
  getSelectorOptions?: () => SharedSelectorOptions;
}

interface RuntimeSelectorInfo {
  selectorOptions: SharedSelectorOptions;
  argumentSelectorFunctions: ((state: any) => any)[];
}

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

export function setupSelectorMetadata<T extends (...args: any[]) => any>(
  memoizedFn: T,
  originalFn: T,
  creationMetadata: CreationMetadata | undefined
): SelectorMetaDataModel {
  const selectorMetaData: SelectorMetaDataModel = ensureSelectorMetadata(memoizedFn);
  selectorMetaData.originalFn = originalFn;

  const getExplicitSelectorOptions: Function = () =>
    creationMetadata && creationMetadata.getSelectorOptions;

  if (creationMetadata) {
    selectorMetaData.containerClass = creationMetadata.containerClass;
    selectorMetaData.selectorName = creationMetadata.selectorName;
  }

  const selectorMetaDataClone = { ...selectorMetaData };

  selectorMetaData.getSelectorOptions = () =>
    mergeSelectorOptions(selectorMetaDataClone, getExplicitSelectorOptions());

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

export function mergeSelectorOptions(
  selectorMetaData: SelectorMetaDataModel,
  explicitOptions: SharedSelectorOptions = {}
): SharedSelectorOptions {
  const stateClass: StateClassInternal = selectorMetaData && selectorMetaData.containerClass;
  const selectorFn: Function | null = selectorMetaData && selectorMetaData.originalFn;
  const existSelectorOptions: SharedSelectorOptions =
    selectorMetaData && selectorMetaData.getSelectorOptions();

  return {
    ...globalSelectorOptions.get(),
    ...getSelectorOptions(stateClass),
    ...getSelectorOptions(selectorFn),
    ...existSelectorOptions,
    ...explicitOptions
  };
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
 */
export function getSelectorFn(selector: any): SelectFromState {
  const metadata = getSelectorMetadata(selector) || getStoreMetadata(selector);
  return (metadata && metadata.selectFromAppState) || selector;
}
