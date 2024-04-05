import { ɵSharedSelectorOptions, ɵSelectFromRootState } from '@ngxs/store/internals';

export interface CreationMetadata {
  containerClass: any;
  selectorName: string;
  getSelectorOptions?: () => ɵSharedSelectorOptions;
}

export interface RuntimeSelectorInfo {
  selectorOptions: ɵSharedSelectorOptions;
  argumentSelectorFunctions: ɵSelectFromRootState[];
}
