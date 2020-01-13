import { memoize } from '@ngxs/store/internals';

import {
  ensureSelectorMetadata,
  getSelectorMetadata,
  getStoreMetadata,
  SelectorMetaDataModel,
  SharedSelectorOptions,
  RuntimeSelectorContext,
  SelectorFactory,
  SelectFromRootState
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

interface CreationMetadata {
  containerClass: any;
  selectorName: string;
  getSelectorOptions?: () => SharedSelectorOptions;
}

interface RuntimeSelectorInfo {
  selectorOptions: SharedSelectorOptions;
  argumentSelectorFunctions: SelectFromRootState[];
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
  Object.setPrototypeOf(memoizedFn, originalFn);

  const selectorMetaData = setupSelectorMetadata<T>(originalFn, creationMetadata);

  const makeRootSelector: SelectorFactory = (context: RuntimeSelectorContext) => {
    const { argumentSelectorFunctions, selectorOptions } = getRuntimeSelectorInfo(
      context,
      selectorMetaData,
      selectors
    );

    return function selectFromRoot(rootState: any) {
      // Determine arguments from the app state using the selectors
      const results = argumentSelectorFunctions.map(argFn => argFn(rootState));

      // if the lambda tries to access a something on the
      // state that doesn't exist, it will throw a TypeError.
      // since this is quite usual behaviour, we simply return undefined if so.
      try {
        return memoizedFn(...results);
      } catch (ex) {
        if (ex instanceof TypeError && selectorOptions.suppressErrors) {
          return undefined;
        }

        throw ex;
      }
    };
  };

  selectorMetaData.makeRootSelector = makeRootSelector;

  return memoizedFn;
}

function setupSelectorMetadata<T extends (...args: any[]) => any>(
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

function getRuntimeSelectorInfo(
  context: RuntimeSelectorContext,
  selectorMetaData: SelectorMetaDataModel,
  selectors: any[] | undefined = []
): RuntimeSelectorInfo {
  const localSelectorOptions = selectorMetaData.getSelectorOptions();
  const selectorOptions = context.getSelectorOptions(localSelectorOptions);
  const selectorsToApply = getSelectorsToApply(
    selectors,
    selectorOptions,
    selectorMetaData.containerClass
  );

  const argumentSelectorFunctions = selectorsToApply.map(selector => {
    const factory = getRootSelectorFactory(selector);
    return factory(context);
  });
  return {
    selectorOptions,
    argumentSelectorFunctions
  };
}

function getLocalSelectorOptions(
  selectorMetaData: SelectorMetaDataModel,
  explicitOptions: SharedSelectorOptions
): SharedSelectorOptions {
  return {
    ...(selectorOptionsMetaAccessor.getOptions(selectorMetaData.containerClass) || {}),
    ...(selectorOptionsMetaAccessor.getOptions(selectorMetaData.originalFn) || {}),
    ...(selectorMetaData.getSelectorOptions() || {}),
    ...explicitOptions
  };
}

function getSelectorsToApply(
  selectors: any[] | undefined = [],
  selectorOptions: SharedSelectorOptions,
  containerClass: any
) {
  const selectorsToApply = [];
  const canInjectContainerState =
    selectors.length === 0 || selectorOptions.injectContainerState;
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
 * This function gets the factory function to create the selector to get the selected slice from the app state
 * @ignore
 */
export function getRootSelectorFactory(selector: any): SelectorFactory {
  const metadata = getSelectorMetadata(selector) || getStoreMetadata(selector);
  return (metadata && metadata.makeRootSelector) || (() => selector);
}
