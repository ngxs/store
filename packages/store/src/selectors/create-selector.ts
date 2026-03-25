import { CreationMetadata } from './selector-models';
import { setupSelectorMetadata } from './selector-metadata';
import { createMemoizedSelectorFn, createRootSelectorFactory } from './selector-utils';

import { ɵSelectorDef, ɵSelectorReturnType } from './selector-types.util';

type SelectorArg = ɵSelectorDef<any>;

/**
 * Function for creating a selector
 * @param selectors The selectors to use to create the arguments of this function
 * @param originalFn The original function being made into a selector
 * @param creationMetadata
 */
export function createSelector<
  Selectors extends SelectorArg[],
  TProjector extends (
    ...selectorResult: { [K in keyof Selectors]: ɵSelectorReturnType<Selectors[K]> }
  ) => any
>(
  selectors: [...Selectors],
  projector: TProjector,
  creationMetadata?: Partial<CreationMetadata>
): TProjector {
  const memoizedFn = createMemoizedSelectorFn<TProjector>(projector, creationMetadata);

  const selectorMetaData = setupSelectorMetadata<TProjector>(projector, creationMetadata);

  selectorMetaData.makeRootSelector = createRootSelectorFactory<TProjector>(
    selectorMetaData,
    selectors,
    memoizedFn
  );

  return memoizedFn;
}
