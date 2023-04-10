import { SharedSelectorOptions, SelectFromRootState } from '../internal/internals';

export interface CreationMetadata {
  containerClass: any;
  selectorName: string;
  getSelectorOptions?: () => SharedSelectorOptions;
}

export interface RuntimeSelectorInfo {
  selectorOptions: SharedSelectorOptions;
  argumentSelectorFunctions: SelectFromRootState[];
}
