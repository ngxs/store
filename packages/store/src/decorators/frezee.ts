import { deepFreeze } from '../utils/freeze';

export interface FreezeOptions {
  deep: boolean;
}

/**
 * Freeze constructor and prototype.
 * @param options Partial<FreezeOptions>.
 */
export function Freeze(options: Partial<FreezeOptions> = {}) {
  return function<T extends { new (...args: any[]): object }>(target: T): T {
    return class FreezeAction extends target {
      constructor(...args: any[]) {
        super(...args);
        if (options.deep) {
          deepFreeze(this);
        } else {
          Object.freeze(this);
        }
      }
    };
  };
}
