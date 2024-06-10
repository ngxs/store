/**
 * These types are exported privately for developers who work on advanced
 * utilities and may need to use these types externally. For instance,
 * they may have a function that accepts selector functions and returns
 * signals with the type corresponding to the return type of those selectors.
 */
export {
  ɵSelectorFunc,
  ɵStateSelector,
  ɵSelectorDef,
  ɵSelectorReturnType
} from './selector-types.util';
