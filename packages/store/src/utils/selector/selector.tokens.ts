import { SharedSelectorOptions, StateClassInternal } from '../../internal/internals';

export const SELECTOR_OPTIONS_META_KEY = 'NGXS_SELECTOR_OPTIONS_META';

export type CreationMetadata = {
  selectorName: string;
  containerClass: StateClassInternal;
  getSelectorOptions?: () => SharedSelectorOptions;
};

export type RuntimeSelectorInfo = {
  selectorOptions: SharedSelectorOptions;
  argumentSelectorFunctions: ((state: StateClassInternal) => any)[];
};

export const selectorOptionsMetaAccessor = {
  getOptions: (target: any): SharedSelectorOptions => {
    return (target && (<any>target)[SELECTOR_OPTIONS_META_KEY]) || {};
  },
  defineOptions: (target: any, options: SharedSelectorOptions) => {
    if (!target) return;
    (<any>target)[SELECTOR_OPTIONS_META_KEY] = options;
  }
};
