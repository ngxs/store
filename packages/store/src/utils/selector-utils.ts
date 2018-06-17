import { META_KEY } from '../symbols';
import { SelectFromState, SelectorMetaDataModel, fastPropGetter } from '../internal/internals';

/**
 * This function gets the selector function to be used to get the selected slice from the app state
 * @ignore
 */
export function getSelectorFn(selector: any): SelectFromState {
  const metadata = selector[META_KEY];
  if (metadata) {
    const selectFromAppState = (<SelectorMetaDataModel>metadata).selectFromAppState;
    if (selectFromAppState) {
      return selectFromAppState;
    } else if (metadata.path) {
      return fastPropGetter(metadata.path.split('.'));
    }
  }
  return selector;
}
