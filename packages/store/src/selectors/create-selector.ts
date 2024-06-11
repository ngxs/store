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
  S1 extends SelectorArg,
  TProjector extends (s1: ɵSelectorReturnType<S1>) => any
>(
  selectors: [S1],
  projector: TProjector,
  creationMetadata?: Partial<CreationMetadata>
): TProjector;

export function createSelector<
  S1 extends SelectorArg,
  S2 extends SelectorArg,
  TProjector extends (s1: ɵSelectorReturnType<S1>, s2: ɵSelectorReturnType<S2>) => any
>(
  selectors: [S1, S2],
  projector: TProjector,
  creationMetadata?: Partial<CreationMetadata>
): TProjector;

export function createSelector<
  S1 extends SelectorArg,
  S2 extends SelectorArg,
  S3 extends SelectorArg,
  TProjector extends (
    s1: ɵSelectorReturnType<S1>,
    s2: ɵSelectorReturnType<S2>,
    s3: ɵSelectorReturnType<S3>
  ) => any
>(
  selectors: [S1, S2, S3],
  projector: TProjector,
  creationMetadata?: Partial<CreationMetadata>
): TProjector;

export function createSelector<
  S1 extends SelectorArg,
  S2 extends SelectorArg,
  S3 extends SelectorArg,
  S4 extends SelectorArg,
  TProjector extends (
    s1: ɵSelectorReturnType<S1>,
    s2: ɵSelectorReturnType<S2>,
    s3: ɵSelectorReturnType<S3>,
    s4: ɵSelectorReturnType<S4>
  ) => any
>(
  selectors: [S1, S2, S3, S4],
  projector: TProjector,
  creationMetadata?: Partial<CreationMetadata>
): TProjector;

export function createSelector<
  S1 extends SelectorArg,
  S2 extends SelectorArg,
  S3 extends SelectorArg,
  S4 extends SelectorArg,
  S5 extends SelectorArg,
  TProjector extends (
    s1: ɵSelectorReturnType<S1>,
    s2: ɵSelectorReturnType<S2>,
    s3: ɵSelectorReturnType<S3>,
    s4: ɵSelectorReturnType<S4>,
    s5: ɵSelectorReturnType<S5>
  ) => any
>(
  selectors: [S1, S2, S3, S4, S5],
  projector: TProjector,
  creationMetadata?: Partial<CreationMetadata>
): TProjector;

export function createSelector<
  S1 extends SelectorArg,
  S2 extends SelectorArg,
  S3 extends SelectorArg,
  S4 extends SelectorArg,
  S5 extends SelectorArg,
  S6 extends SelectorArg,
  TProjector extends (
    s1: ɵSelectorReturnType<S1>,
    s2: ɵSelectorReturnType<S2>,
    s3: ɵSelectorReturnType<S3>,
    s4: ɵSelectorReturnType<S4>,
    s5: ɵSelectorReturnType<S5>,
    s6: ɵSelectorReturnType<S6>
  ) => any
>(
  selectors: [S1, S2, S3, S4, S5, S6],
  projector: TProjector,
  creationMetadata?: Partial<CreationMetadata>
): TProjector;

export function createSelector<
  S1 extends SelectorArg,
  S2 extends SelectorArg,
  S3 extends SelectorArg,
  S4 extends SelectorArg,
  S5 extends SelectorArg,
  S6 extends SelectorArg,
  S7 extends SelectorArg,
  TProjector extends (
    s1: ɵSelectorReturnType<S1>,
    s2: ɵSelectorReturnType<S2>,
    s3: ɵSelectorReturnType<S3>,
    s4: ɵSelectorReturnType<S4>,
    s5: ɵSelectorReturnType<S5>,
    s6: ɵSelectorReturnType<S6>,
    s7: ɵSelectorReturnType<S7>
  ) => any
>(
  selectors: [S1, S2, S3, S4, S5, S6, S7],
  projector: TProjector,
  creationMetadata?: Partial<CreationMetadata>
): TProjector;

export function createSelector<
  S1 extends SelectorArg,
  S2 extends SelectorArg,
  S3 extends SelectorArg,
  S4 extends SelectorArg,
  S5 extends SelectorArg,
  S6 extends SelectorArg,
  S7 extends SelectorArg,
  S8 extends SelectorArg,
  TProjector extends (
    s1: ɵSelectorReturnType<S1>,
    s2: ɵSelectorReturnType<S2>,
    s3: ɵSelectorReturnType<S3>,
    s4: ɵSelectorReturnType<S4>,
    s5: ɵSelectorReturnType<S5>,
    s6: ɵSelectorReturnType<S6>,
    s7: ɵSelectorReturnType<S7>,
    s8: ɵSelectorReturnType<S8>
  ) => any
>(
  selectors: [S1, S2, S3, S4, S5, S6, S7, S8],
  projector: TProjector,
  creationMetadata?: Partial<CreationMetadata>
): TProjector;

export function createSelector<T extends (...args: any[]) => any>(
  selectors: SelectorArg[] | undefined,
  projector: T,
  creationMetadata?: Partial<CreationMetadata>
): T;

export function createSelector<T extends (...args: any[]) => any>(
  selectors: SelectorArg[] | undefined,
  projector: T,
  creationMetadata?: Partial<CreationMetadata>
) {
  const memoizedFn = createMemoizedSelectorFn<T>(projector, creationMetadata);

  const selectorMetaData = setupSelectorMetadata<T>(projector, creationMetadata);

  selectorMetaData.makeRootSelector = createRootSelectorFactory<T>(
    selectorMetaData,
    selectors,
    memoizedFn
  );

  return memoizedFn;
}
