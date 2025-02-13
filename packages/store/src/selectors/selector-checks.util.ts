import { ɵgetSelectorMetadata, ɵgetStoreMetadata } from '@ngxs/store/internals';
import { ɵSelectorDef } from './selector-types.util';
import { NgZone } from '@angular/core';

function getMissingMetaDataError(
  selector: ɵSelectorDef<any>,
  context: { prefix?: string; noun?: string } = {}
) {
  const metadata = ɵgetSelectorMetadata(selector) || ɵgetStoreMetadata(selector as any);
  if (!metadata) {
    return new Error(
      `${context.prefix}The value provided as the ${context.noun} is not a valid selector.`
    );
  }
  return null;
}

export function ensureValidSelector(
  selector: ɵSelectorDef<any>,
  context: { prefix?: string; noun?: string } = {}
) {
  const noun = context.noun || 'selector';
  const prefix = context.prefix ? context.prefix + ': ' : '';
  ensureValueProvided(selector, { noun, prefix: context.prefix });
  const error = getMissingMetaDataError(selector, { noun, prefix });
  if (error) {
    // If we have used this utility within a state class, we may be
    //  before the @State or @Selector decorators have been applied.
    //  wait until the next microtask to verify.
    // Theoretically this situation is only encountered when the javascript
    //  files are being loaded and we are outside the angular zone.
    if (!NgZone.isInAngularZone()) {
      Promise.resolve().then(() => {
        const errorAgain = getMissingMetaDataError(selector, { noun, prefix });
        if (errorAgain) {
          // Throw the originally captured error so that the stack trace shows the
          // original utility call site.
          console.error(error);
        }
      });
    } else {
      throw error;
    }
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
