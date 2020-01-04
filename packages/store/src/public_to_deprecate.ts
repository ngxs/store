import {
  getSelectorMetadata as getSelectorMetadataInternal,
  getStoreMetadata as getStoreMetadataInternal,
  ensureStoreMetadata as ensureStoreMetadataInternal,
  ensureSelectorMetadata as ensureSelectorMetadataInternal,
  StateClassInternal,
  SharedSelectorOptions
} from './internal/internals';
import { PlainObjectOf } from '../internals/src/symbols';
import { ActionHandlerMetaData } from './actions/symbols';

interface MetaDataModel {
  name: string | null;
  actions: PlainObjectOf<ActionHandlerMetaData[]>;
  defaults: any;
  path: string | null;
  // selectFromAppState: SelectFromState | null;
  // makeRootSelector: SelectorFactory | null; // Don't expose new stuff
  children?: StateClassInternal[];
}

interface SelectorMetaDataModel {
  // selectFromAppState: SelectFromState | null;
  // makeRootSelector: SelectorFactory | null; // Don't expose new stuff
  originalFn: Function | null;
  containerClass: any;
  selectorName: string | null;
  getSelectorOptions: () => SharedSelectorOptions;
}

export function ensureStoreMetadata(target: StateClassInternal<any, any>): MetaDataModel {
  return ensureStoreMetadataInternal(target);
}

export function getStoreMetadata(target: StateClassInternal<any, any>): MetaDataModel {
  return getStoreMetadataInternal(target);
}

export function ensureSelectorMetadata(target: Function): SelectorMetaDataModel {
  return ensureSelectorMetadataInternal(target);
}

export function getSelectorMetadata(target: any): SelectorMetaDataModel {
  return getSelectorMetadataInternal(target);
}
