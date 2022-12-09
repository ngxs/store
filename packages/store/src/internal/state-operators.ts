import {
  throwPatchingArrayError,
  throwPatchingPrimitiveError
} from '../configs/messages.config';
import { ExistingState, StateOperator } from '@ngxs/store/operators';

export function simplePatch<T>(val: Partial<T>): StateOperator<T> {
  return (existingState: ExistingState<T>) => {
    if (Array.isArray(val)) {
      throwPatchingArrayError();
    } else if (typeof val !== 'object') {
      throwPatchingPrimitiveError();
    }

    const newState: any = { ...(existingState as any) };
    for (const key in val) {
      // deep clone for patch compatibility
      // noinspection JSUnfilteredForInLoop (IDE)
      newState[key] = (val as any)[key];
    }

    return newState as T;
  };
}
