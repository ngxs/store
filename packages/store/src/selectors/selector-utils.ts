import {
  ɵmemoize,
  ɵRuntimeSelectorContext,
  ɵSelectorFactory,
  ɵgetStoreMetadata,
  ɵgetSelectorMetadata,
  ɵSelectorMetaDataModel,
  ɵSharedSelectorOptions
} from '@ngxs/store/internals';

import { CreationMetadata, RuntimeSelectorInfo } from './selector-models';

export function createRootSelectorFactory<T extends (...args: any[]) => any>(
  selectorMetaData: ɵSelectorMetaDataModel,
  selectors: any[] | undefined,
  memoizedSelectorFn: T
): ɵSelectorFactory {
  return (context: ɵRuntimeSelectorContext) => {
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
        return memoizedSelectorFn(...results);
      } catch (ex) {
        if (ex instanceof TypeError && selectorOptions.suppressErrors) {
          return undefined;
        }

        throw ex;
      }
    };
  };
}

export function createMemoizedSelectorFn<T extends (...args: any[]) => any>(
  originalFn: T,
  creationMetadata: Partial<CreationMetadata> | undefined
) {
  const containerClass = creationMetadata && creationMetadata.containerClass;
  const wrappedFn = function wrappedSelectorFn(...args: any[]) {
    const returnValue = originalFn.apply(containerClass, args);
    if (returnValue instanceof Function) {
      const innerMemoizedFn = ɵmemoize.apply(null, [returnValue]);
      return innerMemoizedFn;
    }
    return returnValue;
  } as T;
  const memoizedFn = ɵmemoize(wrappedFn);
  Object.setPrototypeOf(memoizedFn, originalFn);
  return memoizedFn;
}

function getRuntimeSelectorInfo(
  context: ɵRuntimeSelectorContext,
  selectorMetaData: ɵSelectorMetaDataModel,
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

function getSelectorsToApply(
  selectors: any[] | undefined = [],
  selectorOptions: ɵSharedSelectorOptions,
  containerClass: any
) {
  const selectorsToApply = [];
  const canInjectContainerState =
    selectors.length === 0 || selectorOptions.injectContainerState;
  if (containerClass && canInjectContainerState) {
    // If we are on a state class, add it as the first selector parameter
    const metadata = ɵgetStoreMetadata(containerClass);
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
export function getRootSelectorFactory(selector: any): ɵSelectorFactory {
  const metadata = ɵgetSelectorMetadata(selector) || ɵgetStoreMetadata(selector);
  return (metadata && metadata.makeRootSelector) || (() => selector);
}
