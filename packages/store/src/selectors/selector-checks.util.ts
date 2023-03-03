import { getSelectorMetadata, getStoreMetadata } from '../internal/internals';
import { SelectorDef } from './selector-types.util';

export function ensureValidSelector(
  selector: SelectorDef<any>,
  context: { prefix?: string; noun?: string } = {}
) {
  const noun = context.noun || 'selector';
  const prefix = context.prefix ? context.prefix + ': ' : '';
  if (!selector) {
    throw new Error(`${prefix}A ${noun} must be provided.`);
  }
  const metadata = getSelectorMetadata(selector) || getStoreMetadata(selector as any);
  if (!metadata) {
    throw new Error(`${prefix}The value provided as the ${noun} is not a valid selector.`);
  }
}
