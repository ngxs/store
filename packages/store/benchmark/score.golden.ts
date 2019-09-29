import { PlainObjectOf } from '@ngxs/store/internals';

export const GOLDEN_SCORE_LIMIT: PlainObjectOf<number> = {
  isObject: 500_000_000, // ops/sec
  topologicalSort: 950_000 // ops/sec
};
