import { CreationMetadata } from './selector-models';
import { setupSelectorMetadata } from './selector-metadata';
import { createMemoizedSelectorFn, createRootSelectorFactory } from './selector-utils';

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
  const memoizedFn = createMemoizedSelectorFn<T>(originalFn, creationMetadata);

  const selectorMetaData = setupSelectorMetadata<T>(originalFn, creationMetadata);

  selectorMetaData.makeRootSelector = createRootSelectorFactory<T>(
    selectorMetaData,
    selectors,
    memoizedFn
  );

  return memoizedFn;
}
