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

declare const ngDevMode: boolean;

const NG_DEV_MODE = typeof ngDevMode !== 'undefined' && ngDevMode;

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

    const { suppressErrors } = selectorOptions;

    return function selectFromRoot(rootState: any) {
      // Determine arguments from the app state using the selectors
      const results = argumentSelectorFunctions.map(argFn => argFn(rootState));

      // If the lambda attempts to access something in the state that doesn't exist,
      // it will throw a `TypeError`. Since this behavior is common, we simply return
      // `undefined` in such cases.
      try {
        return memoizedSelectorFn(...results);
      } catch (ex) {
        if (suppressErrors && ex instanceof TypeError) {
          return undefined;
        }

        // We're logging an error in this function because it may be used by `select`,
        // `selectSignal`, and `selectSnapshot`. Therefore, there's no need to catch
        // exceptions there to log errors.
        if (NG_DEV_MODE) {
          const message =
            'The selector below has thrown an error upon invocation. ' +
            'Please check for any unsafe property access that may result in null ' +
            'or undefined values.';

          // Avoid concatenating the message with the original function, as this will
          // invoke `toString()` on the function. Instead, log it as the second argument.
          // This way, developers will be able to navigate to the actual code in the browser.
          console.error(message, selectorMetaData.originalFn);
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
  // The container state refers to the state class that includes the
  // definition of the selector function, for example:
  // @State()
  // class AnimalsState {
  //   @Selector()
  //   static getAnimals(state: AnimalsStateModel) {}
  // }
  // The `AnimalsState` serves as the container state. Additionally, the
  // selector may reside within a namespace or another class lacking the
  // `@State` decorator, thus not being treated as the container state.
  const canInjectContainerState =
    selectorOptions.injectContainerState || selectors.length === 0;

  if (containerClass && canInjectContainerState) {
    // If we are on a state class, add it as the first selector parameter
    const metadata = ɵgetStoreMetadata(containerClass);
    if (metadata) {
      selectorsToApply.push(containerClass);
    }
  }
  selectorsToApply.push(...selectors);
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
