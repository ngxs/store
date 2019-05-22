import {
  ensureSelectorMetadata,
  getSelectorMetadata,
  getStoreMetadata,
  globalSelectorOptions,
  SelectFromState,
  SelectorMetaDataModel,
  SelectorType,
  SharedSelectorOptions,
  StateClassInternal
} from '../../internal/internals';
import {
  CreationMetadata,
  RuntimeSelectorInfo,
  selectorOptionsMetaAccessor
} from './selector.tokens';

export class SelectorProcessor {
  /**
   * This function gets the selector function
   * to be used to get the selected slice from the app state
   * @param selector
   */
  public static getSelectorFn(selector: SelectorType): SelectFromState {
    const metadata: SelectorMetaDataModel =
      getSelectorMetadata(selector) || getStoreMetadata(selector as StateClassInternal);

    return (metadata && metadata.selectFromAppState) || (selector as SelectFromState);
  }

  public static setupSelectorMetadata<T extends (...args: any[]) => any>(
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
      SelectorProcessor.getCustomSelectorOptions(
        selectorMetaDataClone,
        getExplicitSelectorOptions()
      );
    return selectorMetaData;
  }

  public static getSelectorsToApply(
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

  public static getRuntimeSelectorInfo(
    selectorMetaData: SelectorMetaDataModel,
    selectors: any[] | undefined = []
  ): RuntimeSelectorInfo {
    const selectorOptions = selectorMetaData.getSelectorOptions();
    const selectorsToApply = SelectorProcessor.getSelectorsToApply(
      selectorMetaData,
      selectors
    );

    const argumentSelectorFunctions = selectorsToApply.map((selector: any) =>
      SelectorProcessor.getSelectorFn(selector)
    );

    return {
      selectorOptions,
      argumentSelectorFunctions
    };
  }

  public static getCustomSelectorOptions(
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
}
