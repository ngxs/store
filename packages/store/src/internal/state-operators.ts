import {
  throwPatchingArrayError,
  throwPatchingPrimitiveError
} from '../configs/messages.config';
import { ExistingState, StateOperator } from '@ngxs/store/operators';

export function simplePatch<T>(value: Partial<T>): StateOperator<T> {
  return (existingState: ExistingState<T>) => {
    if (typeof ngDevMode !== 'undefined' && ngDevMode) {
      if (Array.isArray(value)) {
        throwPatchingArrayError();
      } else if (typeof value !== 'object') {
        throwPatchingPrimitiveError();
      }
    }

    const newState: any = { ...(existingState as any) };
    for (const key in value) {
      // deep clone for patch compatibility
      newState[key] = (value as any)[key];
    }

    return newState as T;
  };
}
