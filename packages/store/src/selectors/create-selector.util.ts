import { createSelector as createSelectorOrig } from './create-selector';
import { SelectorDef, SelectorReturnType } from './selector-types.util';

type SelectorArg = SelectorDef<any>;

type CreationMetadata = Parameters<typeof createSelectorOrig>[2];

// NOTE: This is temporarily named differently to `createSelector`, and
//  will be renamed when the types interface is finalised and publically exported.
//  Adding this here so that other dependent types can leverage this in the interim.
export function createSelectorX<
  S1 extends SelectorArg,
  TProjector extends (s1: SelectorReturnType<S1>) => any
>(
  selectors: [S1],
  projector: TProjector,
  creationMetadata?: Partial<CreationMetadata>
): TProjector;

export function createSelectorX<
  S1 extends SelectorArg,
  S2 extends SelectorArg,
  TProjector extends (s1: SelectorReturnType<S1>, s2: SelectorReturnType<S2>) => any
>(
  selectors: [S1, S2],
  projector: TProjector,
  creationMetadata?: Partial<CreationMetadata>
): TProjector;

export function createSelectorX<
  S1 extends SelectorArg,
  S2 extends SelectorArg,
  S3 extends SelectorArg,
  TProjector extends (
    s1: SelectorReturnType<S1>,
    s2: SelectorReturnType<S2>,
    s3: SelectorReturnType<S3>
  ) => any
>(
  selectors: [S1, S2, S3],
  projector: TProjector,
  creationMetadata?: Partial<CreationMetadata>
): TProjector;

export function createSelectorX<
  S1 extends SelectorArg,
  S2 extends SelectorArg,
  S3 extends SelectorArg,
  S4 extends SelectorArg,
  TProjector extends (
    s1: SelectorReturnType<S1>,
    s2: SelectorReturnType<S2>,
    s3: SelectorReturnType<S3>,
    s4: SelectorReturnType<S4>
  ) => any
>(
  selectors: [S1, S2, S3, S4],
  projector: TProjector,
  creationMetadata?: Partial<CreationMetadata>
): TProjector;

export function createSelectorX<
  S1 extends SelectorArg,
  S2 extends SelectorArg,
  S3 extends SelectorArg,
  S4 extends SelectorArg,
  S5 extends SelectorArg,
  TProjector extends (
    s1: SelectorReturnType<S1>,
    s2: SelectorReturnType<S2>,
    s3: SelectorReturnType<S3>,
    s4: SelectorReturnType<S4>,
    s5: SelectorReturnType<S5>
  ) => any
>(
  selectors: [S1, S2, S3, S4, S5],
  projector: TProjector,
  creationMetadata?: Partial<CreationMetadata>
): TProjector;

export function createSelectorX<
  S1 extends SelectorArg,
  S2 extends SelectorArg,
  S3 extends SelectorArg,
  S4 extends SelectorArg,
  S5 extends SelectorArg,
  S6 extends SelectorArg,
  TProjector extends (
    s1: SelectorReturnType<S1>,
    s2: SelectorReturnType<S2>,
    s3: SelectorReturnType<S3>,
    s4: SelectorReturnType<S4>,
    s5: SelectorReturnType<S5>,
    s6: SelectorReturnType<S6>
  ) => any
>(
  selectors: [S1, S2, S3, S4, S5, S6],
  projector: TProjector,
  creationMetadata?: Partial<CreationMetadata>
): TProjector;

export function createSelectorX<
  S1 extends SelectorArg,
  S2 extends SelectorArg,
  S3 extends SelectorArg,
  S4 extends SelectorArg,
  S5 extends SelectorArg,
  S6 extends SelectorArg,
  S7 extends SelectorArg,
  TProjector extends (
    s1: SelectorReturnType<S1>,
    s2: SelectorReturnType<S2>,
    s3: SelectorReturnType<S3>,
    s4: SelectorReturnType<S4>,
    s5: SelectorReturnType<S5>,
    s6: SelectorReturnType<S6>,
    s7: SelectorReturnType<S7>
  ) => any
>(
  selectors: [S1, S2, S3, S4, S5, S6, S7],
  projector: TProjector,
  creationMetadata?: Partial<CreationMetadata>
): TProjector;

export function createSelectorX<
  S1 extends SelectorArg,
  S2 extends SelectorArg,
  S3 extends SelectorArg,
  S4 extends SelectorArg,
  S5 extends SelectorArg,
  S6 extends SelectorArg,
  S7 extends SelectorArg,
  S8 extends SelectorArg,
  TProjector extends (
    s1: SelectorReturnType<S1>,
    s2: SelectorReturnType<S2>,
    s3: SelectorReturnType<S3>,
    s4: SelectorReturnType<S4>,
    s5: SelectorReturnType<S5>,
    s6: SelectorReturnType<S6>,
    s7: SelectorReturnType<S7>,
    s8: SelectorReturnType<S8>
  ) => any
>(
  selectors: [S1, S2, S3, S4, S5, S6, S7, S8],
  projector: TProjector,
  creationMetadata?: Partial<CreationMetadata>
): TProjector;

export function createSelectorX<T extends (...args: any[]) => any>(
  selectors: any[],
  projector: T,
  creationMetadata?: Partial<CreationMetadata>
): T {
  return createSelectorOrig<T>(selectors, projector, <CreationMetadata>creationMetadata);
}
