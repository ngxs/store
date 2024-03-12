import { ɵgetSelectorMetadata, ɵgetStoreMetadata } from '@ngxs/store/internals';

import { SelectorDef } from './selector-types.util';

export function ensureValidSelector(
  selector: SelectorDef<any>,
  context: { prefix?: string; noun?: string } = {}
) {
  const noun = context.noun || 'selector';
  const prefix = context.prefix ? context.prefix + ': ' : '';
  ensureValueProvided(selector, { noun, prefix: context.prefix });
  const metadata = ɵgetSelectorMetadata(selector) || ɵgetStoreMetadata(selector as any);
  if (!metadata) {
    throw new Error(`${prefix}The value provided as the ${noun} is not a valid selector.`);
  }
}

export function ensureValueProvided(
  value: any,
  context: { prefix?: string; noun?: string } = {}
) {
  const noun = context.noun || 'value';
  const prefix = context.prefix ? context.prefix + ': ' : '';
  if (!value) {
    throw new Error(`${prefix}A ${noun} must be provided.`);
  }
}
