import {
  CONFIG_MESSAGES as MESSAGES,
  VALIDATION_CODE as CODE
} from '../configs/messages.config';
import { StateOperator } from '../symbols';

export function simplePatch<T>(val: Partial<T>): StateOperator<T> {
  return (existingState: Readonly<T>) => {
    if (Array.isArray(val)) {
      throw new Error(MESSAGES[CODE.PATCHING_ARRAY]());
    } else if (typeof val !== 'object') {
      throw new Error(MESSAGES[CODE.PATCHING_PRIMITIVE]());
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
