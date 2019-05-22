import { memoize } from '@ngxs/store/internals';
import { CreationMetadata, RuntimeSelectorInfo } from './selector.tokens';
import { SelectorProcessor } from './selector-processor';

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
  const selectorMetaData = SelectorProcessor.setupSelectorMetadata<T>(
    memoizedFn,
    originalFn,
    creationMetadata
  );
  let runtimeInfo: RuntimeSelectorInfo;

  const selectFromAppState = (state: any) => {
    const results = [];

    runtimeInfo =
      runtimeInfo || SelectorProcessor.getRuntimeSelectorInfo(selectorMetaData, selectors);
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
